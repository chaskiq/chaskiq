# frozen_string_literal: true

class Badge::Component < ApplicationViewComponent
  option :size, default: ->{'default'}
  option :variant, default: ->{'gray'}
  option :class_name, default: ->{''}
end
