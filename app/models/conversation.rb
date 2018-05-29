class Conversation < ApplicationRecord
  belongs_to :app
  belongs_to :assignee, class_name: 'User'
  belongs_to :main_participant, class_name: "User"
  has_many :conversation_parts
end
