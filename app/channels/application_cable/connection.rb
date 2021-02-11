# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base

    identified_by :current_user, :app

    def connect
      self.current_user = find_resource
    end

    # finds agent or app user
    def find_resource
      params = request.query_parameters()
      return find_verified_agent if params[:token]
      get_session_data
    end

    def find_verified_agent
      user = Agent.find_by(id: access_token.resource_owner_id) if access_token 
      return user if user
      raise "invalid user"
    end
  
    def access_token
      params = request.query_parameters()
      self.app = App.find_by(key: params[:app])
      @access_token ||= Doorkeeper::AccessToken.by_token(params[:token])
    end

    def get_session_data
      params = request.query_parameters()
      self.app = App.find_by(key: params[:app])

      if self.app.blank?
        # Bugsnag.notify("error getting session data") do |report|
        #   report.add_tab(
        #     :context,
        #     {
        #       origin: env['HTTP_ORIGIN'],
        #       params: params
        #     }
        #   )
        # end
        # return 
      end

      OriginValidator.new(
        app: app.domain_url,
        host: env['HTTP_ORIGIN']
      ).is_valid?
  
      find_user(get_user_data)
    end

    rescue_from StandardError, with: :report_error

    private

    def report_error(e)
      Bugsnag.notify(e) do |report|
        report.add_tab(
          :context,
          {
            app: self.app&.key,
            env: env['HTTP_ORIGIN'],
            params: request.query_parameters,
            current_user: self.current_user&.key,
            cookie: cookies[cookie_namespace]
          }
        )
      end
    end

    def get_user_data
      if app.encryption_enabled?
        authorize_by_encrypted_params
      else
        get_user_from_unencrypted
      end
    end

    def authorize_by_encrypted_params
      params = request.query_parameters()
      app.decrypt(params[:enc])
    end

    def get_user_by_session
      app.app_users.find_by(session_id: cookies[cookie_namespace])
    end

    def cookie_namespace
      "chaskiq_session_id_#{app.key.gsub("-", "")}".to_sym
    end

    def find_user(user_data)
      if user_data.blank?
        visitor = get_user_by_session
      else
        app.app_users.find_by(email: user_data[:email])
      end
    end
  end
end
