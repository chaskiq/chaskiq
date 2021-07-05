# frozen_string_literal: true

class DefinitionRenderer::Component < ApplicationViewComponent
  option :schema
  option :size
  option :app_package
  option :location
  option :values
  option :blocks
  option :size, default: -> { 'sm' }
  option :theme, default: -> { nil }
  option :conversation_key, default: ->{nil}
  option :app, default: ->{nil}
  option :path, default: ->{nil}
  option :ctx, default: ->{ {} }
end
