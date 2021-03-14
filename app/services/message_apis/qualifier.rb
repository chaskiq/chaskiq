# frozen_string_literal: true

module MessageApis
  class Qualifier < BasePackage
    attr_accessor :secret

    # for display in replied message
    def self.display_data(data); end
  end
end
