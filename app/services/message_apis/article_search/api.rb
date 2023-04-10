# frozen_string_literal: true

module MessageApis::ArticleSearch
  class Api < MessageApis::BasePackage
    attr_accessor :secret

    def self.definition_info
      {
        name: "ArticleSearch",
        description: "Let customers find and read help articles",
        capability_list: ["home"],
        state: "enabled",
        definitions: []
      }
    end

    # for display in replied message
    def self.display_data(data); end
  end
end
