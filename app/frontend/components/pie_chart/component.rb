# frozen_string_literal: true

class PieChart::Component < ApplicationViewComponent
	def initialize(data:, label:)
    @data = data
    @label = label
  end
end
