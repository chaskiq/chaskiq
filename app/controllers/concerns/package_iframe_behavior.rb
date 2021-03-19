# frozen_string_literal: true

module PackageIframeBehavior
  extend ActiveSupport::Concern

  def package_iframe
    data = JSON.parse(params[:data])
    @app = App.find_by(key: data['data']['app_id'])

    url_base = data['data']['field']['action']['url']
    url = handle_url_data(url_base)
    # TODO: unify this with the API auth
    app_user, app_data = handle_user_data(data)

    app_user.as_json(methods: %i[
                       email
                       name
                       display_name
                       avatar_url
                       first_name
                       last_name
                     ])

    resp = iframe_package_request(url, data, app_user)
    render html: resp, layout: false
    # render "app_packages/#{params[:package]}/show", layout: false
  end

  def package_iframe_internal
    # TODO: securize this:
    # validate convesation_key & message_key
    # if params['conversation_id']
    #  conversation = Conversation.find_by(key: params['conversation_key'])
    #  app = conversation.app
    # else

    app = AppUser.find(params[:user]['id']).app
    # end

    presenter = app.app_package_integrations
                   .joins(:app_package)
                   .find_by("app_packages.name": params['package'])
                   .presenter

    opts = {
      app_key: app.key,
      user: params[:user],
      field: params.dig(:data, :field),
      values: params.dig(:data, :values)
    }

    opts.merge!({
                  conversation_key: params.dig(:data, :conversation_key),
                  message_key: params.dig(:data, :message_key)
                })

    html = presenter.sheet_view(opts)

    response.headers.delete 'X-Frame-Options'

    render html: html.html_safe, layout: false
  end

  def handle_user_data(data)
    user_data = @app.decrypt(data['data']['enc_data'])
    app_user = if user_data.present? && user_data[:email].present?
                 @app.app_users.users.find_by(email: user_data[:email])
               else
                 @app.app_users.find_by(
                   session_id: cookies[cookie_namespace]
                 )
               end
  rescue StandardError
    app_user = @app.app_users.find_by(
      session_id: cookies[cookie_namespace]
    )
  end

  def handle_url_data(url_base)
    if url_base.match(%r{^/package_iframe_internal/})
      "#{ENV['HOST']}#{url_base}"
    else
      url_base
    end
  end

  def iframe_package_request(url, data, app_user)
    resp = Faraday.post(url, data.merge!(user: app_user).to_json,
                 'Content-Type' => 'application/json')
    response.headers.delete 'X-Frame-Options'
    resp.body.html_safe
  end
end
