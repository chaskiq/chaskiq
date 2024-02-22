# frozen_string_literal: true

module PackageIframeBehavior
  extend ActiveSupport::Concern

  def package_iframe
    if params[:token]
      data = CHASKIQ_FRAME_VERIFIER.verify(params[:token])

      @app = App.find_by(key: data[:app_id])

      # in case an user_token is provided
      if params[:user_token].present?
        data.merge!({
                      current_user: CHASKIQ_FRAME_VERIFIER.verify(params[:user_token])
                    })
      elsif (!data[:current_user] && !data[:current_user_id]) && session[:messenger_session_id]
        app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])
        data[:user] = app_user
      end

      pkg = AppPackageIntegration.find(data[:package_id])
      html = pkg.presenter.sheet_view(data)
    elsif params[:token].blank? && session[:messenger_session_id]
      @app = App.find_by(key: data[:app_id])
      app_user = @app.app_users.find_by(session_id: session[:messenger_session_id])
      data = {}
      data[:user] = app_user
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

      if url_base.match(%r{^/package_iframe_internal/})

        package = @app.app_package_integrations
                      .joins(:app_package)
                      .find_by("app_packages.name": data["data"]["id"])

        presenter = package.presenter
        data.merge!({ "data" => data["data"].merge("package" => package, "user" => app_user) })

        data["data"].merge!({
                              "app_key" => data["data"]["app_id"],
                              "user" => app_user
                            })

        html = presenter.sheet_view(data["data"]&.with_indifferent_access)
      else
        html = iframe_package_request(url, data, app_user)
      end
    end

    # rubocop:disable Rails/OutputSafety
    response.headers.delete "X-Frame-Options"
    if params[:frame]
      render turbo_stream: [
        turbo_stream.replace(
          params[:frame],
          inline: html.html_safe
        )
      ] and return
    end

    if params[:messengerFrame]
      # render turbo_stream: [
      #  turbo_stream.update("bbbb", inline: html.html_safe),
      #  turbo_stream.replace("header-content", partial: "messenger/base_header", locals: { app: @app })
      # ] and return

      respond_to do |format|
        format.turbo_stream do
          @html = html
          render "apps/packages/package_iframe_internal", layout: false
        end
        format.html do
          render html: html.html_safe, layout: false
        end
      end
    end

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

    if session[:messenger_session_id]
      user = AppUser.find_by(session_id: session[:messenger_session_id])
      app = user.app
    else
      app = AppUser.find(params[:user]["id"]).app
      user = params[:user]
    end
    # end

    presenter = app.app_package_integrations
                   .joins(:app_package)
                   .find_by("app_packages.name": params["package"])
                   .presenter

    opts = {
      app_key: app.key,
      user: user,
      field: params.dig(:data, :field) || params.dig(:ctx, :field),
      values: params.dig(:data, :values) || params[:values]
    }

    opts.merge!({
                  conversation_key: params.dig(:data, :conversation_key) || params.dig(:ctx, :conversation_key),
                  message_key: params.dig(:data, :message_key) || params.dig(:ctx, :message_key)
                })

    html = presenter.sheet_view(opts)

    # rubocop:disable Rails/OutputSafety
    response.headers.delete "X-Frame-Options"
    @html = html.html_safe

    respond_to do |format|
      format.turbo_stream do
        @app = app
        render "apps/packages/package_iframe_internal", layout: false
      end
      format.html do
        render html: html.html_safe, layout: false
      end
    end
    # rubocop:enable Rails/OutputSafety
  end

  def handle_user_data(data)
    user_data = @app.decrypt(data["data"]["enc_data"])

    app_user = if user_data.present? && user_data[:email].present?
                 @app.app_users.users.find_by(email: user_data[:email])
               elsif data.dig("data", "enc_data", "identifier_key") && @app.compare_user_identifier(data["data"]["enc_data"])
                 @app.app_users.users.find_by(email: data.dig("data", "enc_data", "email"))
               elsif data.dig("data", "session_id").present?
                 @app.app_users.find_by(
                   session_id: data.dig("data", "session_id")
                 )
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
