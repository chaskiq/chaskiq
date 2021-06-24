# frozen_string_literal: true

class DropdownComponent < ViewComponent::Base
  renders_many :actions

  def initialize(label: , variant: 'flat-dark', size: 'md', orientation: 'right')
    @label = label
    @variant = variant
    @size = size
    @orientation = orientation
  end
end
