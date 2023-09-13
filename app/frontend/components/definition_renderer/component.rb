# frozen_string_literal: true

class DefinitionRenderer::Component < ApplicationViewComponent
  option :schema
  option :size
  option :app_package, default: -> {}
  option :location
  option :category, default: -> {}
  option :values, default: -> { {} }
  option :blocks
  option :size, default: -> { "sm" }
  option :theme, default: -> {}
  option :conversation_key, default: -> {}
  option :bot_id, default: -> {}
  option :bot_step_id, default: -> {}
  option :bot_path_id, default: -> {}
  option :app, default: -> {}
  option :path, default: -> {}
  option :ctx, default: -> { {} }
end
