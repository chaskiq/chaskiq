# frozen_string_literal: true

class ImageRenderer::Component < ApplicationViewComponent
  option :url
  option :height, default: -> { 64 }
  option :width, default: -> { 64 }
  option :align, default: -> { "left" }
  option :rounded, default: -> { false }
end
