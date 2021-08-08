# frozen_string_literal: true

module MessageApis::Foo
  class Api
    attr_accessor :secret

    def initialize(config:)
      @secret = secret
      @api_key = config["api_key"]
      @url = config["endpoint_url"]
    end
  end
end
