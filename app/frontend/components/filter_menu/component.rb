# frozen_string_literal: true

class FilterMenu::Component < ApplicationViewComponent
  option :items
  option :label
  option :variant, default: ->{nil}
  option :size, default: ->{nil}
  option :orientation, default: ->{nil}
end
