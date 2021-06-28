# frozen_string_literal: true

class ButtonRenderer::Component < ApplicationViewComponent
  option :id
  option :variant, default: -> { "success" }
  option :size, default: ->{'md'}
  option :label
  option :action, default: ->{nil}

  def json_data
    {label: @label, id: @id, action: @action}.to_json
  end
end
