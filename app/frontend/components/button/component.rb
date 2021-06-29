# frozen_string_literal: true

class Button::Component < ApplicationViewComponent
  option :variant, default: ->{'default'}
  option :size, default: -> {'default'}
  option :data, default: -> { {} }
  option :type, default: -> {'button'} 

  def data_attributes()
    @data.map{ |k,v| "data-#{k}=#{v}" }.join(" ")
  end
end
