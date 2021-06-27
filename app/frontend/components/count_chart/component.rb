# frozen_string_literal: true

class CountChart::Component < ApplicationViewComponent
	def initialize(data:, label:, append_label:, subtitle:)
    @data = data
    @label = label
    @append_label = append_label
    @subtitle = subtitle
  end
end
