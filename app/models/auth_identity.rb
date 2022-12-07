class AuthIdentity < ApplicationRecord
  require "auth0_web_token"

  belongs_to :agent

  def self.find_agent_from_token(token)
    json = Auth0WebToken.verify(token)
    AuthIdentity.find_by(uid: json.first["sub"])&.agent
  end
end
