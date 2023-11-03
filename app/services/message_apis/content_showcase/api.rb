# frozen_string_literal: true

require "uri"

module MessageApis::ContentShowcase
  class Api < MessageApis::BasePackage
    attr_accessor :secret

    def self.definition_info
      {
        name: "ContentShowcase",
        description: "Promote relevant content to customers within your Messenger",
        capability_list: %w[home conversations bots],
        state: "enabled",
        definitions: []
      }
    end
  end
end
