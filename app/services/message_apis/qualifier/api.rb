# frozen_string_literal: true

module MessageApis::Qualifier
  class Api < MessageApis::BasePackage
    attr_accessor :secret

    def self.definition_info
      {
        name: "Qualifier",
        description: "Qualification for user",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      }
    end

    # for display in replied message
    def self.display_data(data); end
  end
end
