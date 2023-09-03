# frozen_string_literal: true

class TextRenderer::Preview < ApplicationViewComponentPreview
  # You can specify the container class for the default template
  # self.container_class = "w-1/2 border border-gray-300"

  def default
    render_component TextRenderer::Component.new(
      text: "hello world",
      style: "header"
    )
  end

  def aligned
    render_component TextRenderer::Component.new(
      text: "hello world",
      style: "header",
      align: "center"
    )
  end

  def error
    render_component TextRenderer::Component.new(
      text: "hello world",
      style: "error",
      align: "center"
    )
  end

  def notice
    render_component TextRenderer::Component.new(
      text: "hello world",
      style: "notice",
      align: "center"
    )
  end
end
