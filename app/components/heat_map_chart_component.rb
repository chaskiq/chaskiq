# frozen_string_literal: true

class HeatMapChartComponent < ViewComponent::Base
  def initialize(data:, from:, to:)
    @data = data
    @from = from
    @to = to
  end

end
