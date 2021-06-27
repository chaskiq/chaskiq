# frozen_string_literal: true

class Modal::Component < ApplicationViewComponent
	def initialize(title:, subtitle:, btn:)
    @title = title
    @subtitle = subtitle
    @btn = btn
  end
end
