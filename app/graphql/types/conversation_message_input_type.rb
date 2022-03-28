module Types
  class ConversationMessageInputType < Types::BaseInputObject
    argument :message, TYpes::MessageInputType, required: false
  end
end
