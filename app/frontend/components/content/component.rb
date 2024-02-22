# frozen_string_literal: true

class Content::Component < ApplicationViewComponent
  option :data
  option :label
  def initialize(data: "", label: "")
    @data = data
    @label = label
  end
end
