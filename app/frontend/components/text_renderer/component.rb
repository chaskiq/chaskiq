# frozen_string_literal: true

class TextRenderer::Component < ApplicationViewComponent
  option :text
  option :style, default: proc { "paragraph" }
  option :align, default: proc { "left" }
end
