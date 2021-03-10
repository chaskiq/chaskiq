# frozen_string_literal: true

url = Addressable::URI.parse(ENV['HOST'])
subdomain = begin
  url.host.gsub(".#{url.domain}", '')
rescue StandardError
  nil
end

APP_SUBDOMAINS = ['www', 'app', subdomain].compact.uniq.freeze
