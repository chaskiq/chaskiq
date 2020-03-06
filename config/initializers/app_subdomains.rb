# frozen_string_literal: true
url = Addressable::URI.parse(ENV['HOST']) 
subdomain = url.host.gsub(url.domain, "").gsub(".", "") rescue nil

APP_SUBDOMAINS = ["www", "app", subdomain].compact.uniq.freeze
