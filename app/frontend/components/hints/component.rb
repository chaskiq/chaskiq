# frozen_string_literal: true

class Hints::Component < ApplicationViewComponent
  option :type

  def content_data
    I18n.t("hints.#{@type}")
  end
end
