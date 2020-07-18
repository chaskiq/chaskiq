# geocoder request override
module GeocoderRequestOverride
  #   The location() method is vulnerable to trivial IP spoofing.
  #   Don't use it in authorization/authentication code, or any
  #   other security-sensitive application.  Use safe_location
  #   instead.
  def location

    # plan: some round robin of services here ?
    #Geocoder.search("186.105.30.113", 
    #  ip_address: true, 
    #  ip_lookup: GEOCODER_SERVICES.sample.slice(:name)[:name]  
    #)

    @location ||= Geocoder.search(
      geocoder_spoofable_ip, 
      ip_address: true,
      ip_lookup: DEFAULT_GEOCODER_SERVICE[:name],
      #api_key: DEFAULT_GEOCODER_SERVICE[:api_key]
    ).first

    # default
    # @location ||= Geocoder.search(
    #  geocoder_spoofable_ip, 
    #  ip_address: true
    # ).first
  end
end

ActionDispatch::Request.__send__(:include, GeocoderRequestOverride) if defined?(ActionDispatch::Request)
Rack::Request.__send__(:include, GeocoderRequestOverride) if defined?(Rack::Request)