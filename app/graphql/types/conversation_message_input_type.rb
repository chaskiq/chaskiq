module Types
  class ConversationMessageInputType < Types::BaseInputObject
    argument :message, Types::MessageInputType, required: false
  end
end
