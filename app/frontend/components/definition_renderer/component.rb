# frozen_string_literal: true

class DefinitionRenderer::Component < ApplicationViewComponent
  option :schema
  option :app_package, default: -> {}
  option :location
  option :category, default: -> {}
  option :values, default: -> { {} }
  option :blocks
  option :disabled, default: -> { false }
  option :size, default: -> { "" }
  option :theme, default: -> {}
  option :conversation_key, default: -> {}
  option :message_key, default: -> {}
  option :bot_id, default: -> {}
  option :bot_step_id, default: -> {}
  option :bot_path_id, default: -> {}
  option :app, default: -> {}
  option :frame, default: -> {}
  option :path, default: -> {}
  option :ctx, default: -> { {} }
end
