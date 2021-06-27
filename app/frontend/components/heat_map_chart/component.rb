# frozen_string_literal: true

class HeatMapChart::Component < ApplicationViewComponent
	def initialize(data:, from:, to:)
    @data = data
    @from = from
    @to = to
  end
end
