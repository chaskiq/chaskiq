# frozen_string_literal: true

module MessageApis::InboxSections
  class Api < MessageApis::BasePackage
    attr_accessor :secret

    def self.definition_info
      {
        name: "InboxSections",
        description: "Inbox base blocks for conversation sidebar",
        capability_list: ["inbox"],
        state: "enabled",
        definitions: []
      }
    end
  end
end
