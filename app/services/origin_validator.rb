class OriginValidator
  attr_accessor :app, :host

  def initialize(app:, host:)
    @app = app
    @host = host
  end

  class NonAcceptedOrigin < StandardError
    def message
      "not accepted origin, check your app's domain_url or the origin were your widget is installed"
    end
  end

  def is_valid?
    return true if @app.blank?
    return true if @app == '*'

    raise NonAcceptedOrigin if @app.split(',').map do |domain|
      validate_domain(domain)
    end.none?  do |r|
      r == true
    end

    true
  end

  def validate_domain(domain)
    env_domain = Addressable::URI.parse(
      host
    )

    app_domain = Addressable::URI.parse(domain)

    # for now we will check for domain
    return false if app_domain.normalized_site != env_domain.normalized_site

    true
  end
end
