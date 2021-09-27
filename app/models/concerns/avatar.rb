# frozen_string_literal: true

module Avatar
  extend ActiveSupport::Concern

  AVATAR_SERVICE_PROVIDER = "boring"

  def avatar_url
    email_address = email&.downcase
    hash = Digest::MD5.hexdigest(email_address.to_s)
    "https://www.gravatar.com/avatar/#{hash}?d=blank"
  end
end
