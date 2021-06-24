# frozen_string_literal: true

class ModalComponent < ViewComponent::Base
  def initialize(title:, subtitle:, btn:)
    @title = title
    @subtitle = subtitle
    @btn = btn
  end

end
