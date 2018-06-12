class ConversationPart < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_user
end
