module MessageApis::Stripe
  class Api
    attr_accessor :secret

    def initialize(config:)
      @config = config
    end

    def self.definition_info
      {
        name: "Stripe",
        description: "Stripe Payment buttons",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      }
    end
  end
end
