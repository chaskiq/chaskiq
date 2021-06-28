# frozen_string_literal: true

class InputRenderer::Component < ApplicationViewComponent
  option :id
  option :label
  option :placeholder
  option :save_state
  option :value, default: ->{nil}
  option :disabled, default: ->{false}
  option :loading, default: ->{false}
  option :name
  option :hint, default: ->{nil}
  option :errors, default: ->{nil}
end
