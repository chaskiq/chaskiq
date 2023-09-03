# frozen_string_literal: true

# lib/personalized_domain.rb

DOMAIN = "chaskiq.test"

class PersonalizedDomain
  def self.matches?(request)
    case request.host
    when 'www.#{DOMAIN}', '#{DOMAIN}', nil
      false
    else
      request.subdomain.present? && request.subdomain != "www"
    end
  end
end

class SubdomainOrDomain
  def self.matches?(request)
    if (subdomains = request.subdomains) && subdomains.any?
      subdomain = subdomains.join(".")
      APP_SUBDOMAINS.exclude?(subdomain)
    end
  end
end

class NoSubdomain
  def self.matches?(request)
    # si no hay subdominio o si es www
    request.subdomain.blank? ||
      (request.subdomain == "www") ||
      (request.host != 'www.#{DOMAIN}') ||
      (request.host != '#{DOMAIN}')
  end
end
