# frozen_string_literal: true

# lib/personalized_domain.rb

DOMAIN = 'chaskiq.test'

class PersonalizedDomain
  def self.matches?(request)
    case request.host
    when 'www.#{DOMAIN}', '#{DOMAIN}', nil
      false
    else
      request.subdomain.present? && request.subdomain != 'www'
    end
  end
end

class SubdomainOrDomain
  def self.matches?(request)
    return false if ENV.fetch("SKIP_SUBDOMAIN_CHECK", "false") == "true"
    if request.subdomain.present? && !APP_SUBDOMAINS.include?(request.subdomain)
      true
    # elsif request.host != 'www.#{DOMAIN}'
    #   return true
    else
      false
    end
  end
end

class NoSubdomain
  def self.matches?(request)
    # si no hay subdominio o si es www
    !request.subdomain.present? || 
    (request.subdomain == 'www') || 
    (request.host != 'www.#{DOMAIN}') || 
    (request.host != '#{DOMAIN}')
  end
end
