# frozen_string_literal: true

class ConversationPart::Component < ApplicationViewComponent
  def initialize(message:, app:)
    @app = app
    @message = message
    @block_class = block_class
  end

  def block_class
    return "bg-gray-800 text-white" if @message.authorable.is_a?(AppUser)

    @message.private_note? ? "bg-yellow-300 text-black" : "bg-blue-700 text-white"
  end
end
