# frozen_string_literal: true

url = Addressable::URI.parse(ENV['HOST'])
subdomain = begin
  url.host.split(".").first
rescue StandardError
  nil
end

APP_SUBDOMAINS = ['www', 'app', subdomain].compact.uniq.freeze
