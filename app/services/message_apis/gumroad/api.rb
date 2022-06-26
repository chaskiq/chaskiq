module MessageApis::Gumroad
  class Api
    attr_accessor :secret

    def initialize(config:)
      @config = config
    end
  end
end
