# frozen_string_literal: true

class DefinitionRenderer::Component < ApplicationViewComponent
  option :schema
  option :size
  option :app_package
  option :location
  option :category, default: -> {}
  option :values
  option :blocks
  option :size, default: -> { "sm" }
  option :theme, default: -> {}
  option :conversation_key, default: -> {}
  option :app, default: -> {}
  option :path, default: -> {}
  option :ctx, default: -> { {} }
end
