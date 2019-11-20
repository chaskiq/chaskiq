class ConversationPartEvent < ApplicationRecord
  has_one :conversation_part, as: :messageable

  
end
