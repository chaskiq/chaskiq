# frozen_string_literal: true

class DefinitionRenderer::Component < ApplicationViewComponent
  option :schema
  option :size
  option :app_package
  option :location
  option :values
  option :app, default: ->{nil}
  option :path, default: ->{nil}
end
