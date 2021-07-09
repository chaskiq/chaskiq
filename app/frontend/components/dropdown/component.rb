# frozen_string_literal: true

class Dropdown::Component < ApplicationViewComponent
  option :label
  option :variant, default: -> {'flat-dark'}
  option :size, default: -> {'md'}
  option :orientation, default: -> {'right'}

  renders_many :actions
end
