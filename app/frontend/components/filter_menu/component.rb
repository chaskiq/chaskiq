# frozen_string_literal: true

class FilterMenu::Component < ApplicationViewComponent
  option :items
  option :label
  option :variant, default: -> {}
  option :size, default: -> {}
  option :orientation, default: -> {}
  option :origin, default: -> {}
  option :button, default: -> {}
end
