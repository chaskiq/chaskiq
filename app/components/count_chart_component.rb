# frozen_string_literal: true

class CountChartComponent < ViewComponent::Base
  def initialize(data:, label:, append_label:, subtitle:)
    @data = data
    @label = label
    @append_label = append_label
    @subtitle = subtitle
  end

end
