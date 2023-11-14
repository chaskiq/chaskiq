# frozen_string_literal: true

class Panel::Component < ApplicationViewComponent
  option :title
  option :text
  option :variant, default: -> { "" }
  option :link
  option :classes

  def variant_classes
    case @variant
    when "shadowless" then ""
    else
      "shadow"
    end
  end
end
