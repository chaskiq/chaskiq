# frozen_string_literal: true

class AppPackageChart::Component < ApplicationViewComponent
	def initialize(data:, name: , icon:)
    @data = data
    @name = name
    @icon = icon
  end
end
