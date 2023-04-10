module MessageApis::Gumroad
  class Api
    attr_accessor :secret

    def initialize(config:)
      @config = config
    end

    def self.definition_info
      {
        name: "Gumroad",
        description: "Gumroad Payment buttons",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      }
    end
  end
end
