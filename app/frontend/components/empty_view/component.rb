# frozen_string_literal: true

class EmptyView::Component < ApplicationViewComponent
  option :subtitle
  option :title
  option :text, default: -> { "" }
  option :icon, default: -> {}
  option :shadow_less, default: -> {}
  option :classes, default: -> {}
end
