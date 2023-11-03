# frozen_string_literal: true

module MessageApis::ContactFields
  class Api
    def initialize(config:)
      @config = config
    end

    def self.definition_info
      {
        name: "ContactFields",
        description: "Inbox contact fields editor",
        state: "enabled",
        capability_list: ["inbox"],
        definitions: []
      }
    end
  end
end
