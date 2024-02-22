# frozen_string_literal: true

class TextAreaRenderer::Component < ApplicationViewComponent
  option :id
  option :label
  option :placeholder
  option :save_state
  option :disabled
  option :loading
  option :name
  option :hint
  option :errors
end
