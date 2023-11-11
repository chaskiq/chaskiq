if defined?(CypressOnRails)
  CypressOnRails.configure do |c|
    c.api_prefix = ""
    c.install_folder = File.expand_path("#{__dir__}/../../spec/e2e")
    # WARNING!! CypressOnRails can execute arbitrary ruby code
    # please use with extra caution if enabling on hosted servers or starting your local server on 0.0.0.0
    c.use_middleware = !Rails.env.production?
    #  c.use_vcr_middleware = !Rails.env.production?
    c.logger = Rails.logger

    # If you want to enable a before_request logic, such as authentication, logging, sending metrics, etc.
    #   Refer to https://www.rubydoc.info/gems/rack/Rack/Request for the `request` argument.
    #   Return nil to continue through the Cypress command. Return a response [status, header, body] to halt.
    # c.before_request = lambda { |request|
    #   unless request.env['warden'].authenticate(:secret_key)
    #     return [403, {}, ["forbidden"]]
    #   end
    # }
  end

  # # if you compile your asssets on CI
  # if ENV['CYPRESS'].present? && ENV['CI'].present?
  #  Rails.application.configure do
  #    config.assets.compile = false
  #    config.assets.unknown_asset_fallback = false
  #  end
  # end
end
