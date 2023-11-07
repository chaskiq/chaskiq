# frozen_string_literal: true

class CheckboxRenderer::Component < ApplicationViewComponent
  option :id
  option :options, default: -> { [] }
  option :text, default: -> { }
  option :label, default: -> { }
  option :save_state, default: -> { }
  option :value, default: -> { }
  option :disabled, default: -> { }
end
