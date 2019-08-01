# lib/personalized_domain.rb

DOMAIN = "chaskiq.test"

class PersonalizedDomain
  def self.matches?(request)
    case request.host
    when 'www.#{DOMAIN}', '#{DOMAIN}', nil
      puts "DOMINIOOOOOO CUSTOM!!!"
      false
    else 
      puts "ENTRO!!!"
      request.subdomain.present? && request.subdomain != "www"
    end
  end
end

class SubdomainOrDomain
  def self.matches?(request)
    if request.subdomain.present? && request.subdomain != "www"
      return true
    #elsif request.host != 'www.#{DOMAIN}'
    #   return true
    else
      false
    end
  end
end

class NoSubdomain
  def self.matches?(request)
    # si no hay subdominio o si es www
    !request.subdomain.present? or request.subdomain == "www" or request.host != 'www.#{DOMAIN}' or request.host != '#{DOMAIN}'
  end
end