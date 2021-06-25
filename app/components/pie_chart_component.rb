# frozen_string_literal: true

class PieChartComponent < ViewComponent::Base
  def initialize(data:, label:)
    @data = data
    @label = label
  end

end
