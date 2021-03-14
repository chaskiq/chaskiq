# frozen_string_literal: true

include ActionView::Helpers::AssetUrlHelper
include Webpacker::Helper

module MessageApis
  class ArticleSearch < BasePackage
    attr_accessor :secret

    # for display in replied message
    def self.display_data(data); end
  end
end
