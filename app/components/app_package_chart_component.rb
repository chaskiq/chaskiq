# frozen_string_literal: true

class AppPackageChartComponent < ViewComponent::Base
  def initialize(data:, name: , icon:)
    @data = data
    @name = name
    @icon = icon
  end

end
