module Types
  class MessageInputType < Types::BaseInputObject
    argument :conversation_key, String, required: false
    argument :reply, Types::AnyType, required: false
    argument :trigger, String, required: false
    argument :html, String, required: false
    argument :serialized, String, required: false
    argument :text, String, required: false
    argument :volatile, Boolean, required: false
  end
end
