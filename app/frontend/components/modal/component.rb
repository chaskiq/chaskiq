# frozen_string_literal: true

class Modal::Component < ApplicationViewComponent
  option :title
  option :subtitle, default: ->{''}
  option :action_content, default: -> {nil}
end
