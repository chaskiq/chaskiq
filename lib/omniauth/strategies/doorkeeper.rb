module OmniAuth
  module Strategies
    class Doorkeeper < OmniAuth::Strategies::OAuth2
      option :name, :doorkeeper

      option :client_options,
             site: ENV["HOST"],
             authorize_path: "/oauth/authorize"

      uid do
        raw_info["id"]
      end

      info do
        {
          email: raw_info["email"]
        }
      end

      def raw_info
        @raw_info ||= access_token.get("/api/v1/me.json").parsed
      end
    end
  end
end

# a = Doorkeeper::Application.new :name => 'test', :redirect_uri => 'http://localhost:3000'
# client = OAuth2::Client.new(a.uid, a.secret, site: a.redirect_uri)
# callback = "http://localhost:3000"
# client.auth_code.authorize_url(redirect_uri: callback)
# visit ^
# access = client.auth_code.get_token("code_from_visit_url_redirect")