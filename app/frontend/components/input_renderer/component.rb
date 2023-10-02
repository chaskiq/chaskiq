# frozen_string_literal: true

class InputRenderer::Component < ApplicationViewComponent
  option :id
  option :label
  option :placeholder
  option :save_state
  option :value, default: -> {}
  option :action, default: -> {}
  option :disabled, default: -> { false }
  option :loading, default: -> { false }
  option :name
  option :size, default: -> {}
  option :hint, default: -> {}
  option :errors, default: -> {}
end
