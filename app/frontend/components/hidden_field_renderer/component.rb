class HiddenFieldRenderer::Component < ApplicationViewComponent
  option :id
  option :value, default: -> {}
  option :name
end
