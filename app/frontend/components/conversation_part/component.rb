# frozen_string_literal: true

class ConversationPart::Component < ApplicationViewComponent
	def initialize(message:)
    @message = message
    @block_class = block_class
  end

  def block_class
    return 'bg-white text-green-500' if @message.authorable.is_a?(AppUser)
    @message.private_note? ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white'
  end
end
