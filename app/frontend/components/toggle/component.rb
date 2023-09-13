# frozen_string_literal: true

class Toggle::Component < ApplicationViewComponent
  option :id
  option :url, default: -> { "" }
  option :label
  option :checked
  option :disabled
  option :on_change
end
