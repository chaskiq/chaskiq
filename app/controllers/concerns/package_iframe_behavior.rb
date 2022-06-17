# frozen_string_literal: true

module PackageIframeBehavior
  extend ActiveSupport::Concern

  def package_iframe
    if params[:token]
      data = CHASKIQ_FRAME_VERIFIER.verify(params[:token])
      # in case an user_token is provided
      if params[:user_token].present?
        data.merge!({
                      current_user: CHASKIQ_FRAME_VERIFIER.verify(params[:user_token])
                    })
      end

      @app = App.find_by(key: data[:app_id])

      pkg = AppPackageIntegration.find(data[:package_id])
      html = pkg.presenter.sheet_view(data)
    elsif params[:data].present?
      data = JSON.parse(params[:data])
      @app = App.find_by(key: data["data"]["app_id"])
      url_base = data["data"]["field"]["action"]["url"]
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
      html = iframe_package_request(url, data, app_user)
    end

    # rubocop:disable Rails/OutputSafety
    response.headers.delete "X-Frame-Options"
    render html: html.html_safe, layout: false
    # rubocop:enable Rails/OutputSafety
  end

  def package_iframe_internal
    # TODO: securize this:
    # validate convesation_key & message_key
    # if params['conversation_id']
    #  conversation = Conversation.find_by(key: params['conversation_key'])
    #  app = conversation.app
    # else

    app = AppUser.find(params[:user]["id"]).app
    # end

    presenter = app.app_package_integrations
                   .joins(:app_package)
                   .find_by("app_packages.name": params["package"])
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

    # rubocop:disable Rails/OutputSafety
    response.headers.delete "X-Frame-Options"
    render html: html.html_safe, layout: false
    # rubocop:enable Rails/OutputSafety
  end

  def handle_user_data(data)
    user_data = @app.decrypt(data["data"]["enc_data"])

    app_user = if user_data.present? && user_data[:email].present?
                 @app.app_users.users.find_by(email: user_data[:email])
               elsif data.dig("data", "enc_data", "identifier_key") && @app.compare_user_identifier(data["data"]["enc_data"])
                 @app.app_users.users.find_by(email: data.dig("data", "enc_data", "email"))
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
      "#{Chaskiq::Config.get('HOST')}#{url_base}"
    else
      url_base
    end
  end

  def iframe_package_request(url, data, app_user)
    resp = Faraday.post(url, data.merge!(user: app_user).to_json,
                        "Content-Type" => "application/json")
    resp.body
  end
end
