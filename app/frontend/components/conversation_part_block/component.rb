# frozen_string_literal: true

class ConversationPartBlock::Component < ApplicationViewComponent
	def initialize(message:)
    @message = message
  end
end
