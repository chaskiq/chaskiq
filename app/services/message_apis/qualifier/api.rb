# frozen_string_literal: true

module MessageApis::Qualifier
  class Api < MessageApis::BasePackage
    attr_accessor :secret

    # for display in replied message
    def self.display_data(data); end
  end
end
