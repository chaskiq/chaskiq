class Conversation < ApplicationRecord
  belongs_to :app
  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :main_participant, class_name: "AppUser" #, foreign_key: "user_id"
  has_many :messages, class_name: "ConversationPart"

  include AASM

  aasm column: :state do
    state :opened, :initial => true
    state :closed

    event :reopen do
      transitions :from => :closed, :to => :opened
    end

    event :close do
      transitions :from => :opened, :to => :closed
    end
  end

  def add_message(opts={})
    part          = self.messages.new
    part.app_user = opts[:from]
    part.message  = opts[:message]
    part.save
    
    if part.errors.blank?
      ConversationsChannel.broadcast_to("#{self.app.key}-#{part.app_user.user.email}", 
        part.as_json(only: [:id, :message, :conversation_id]) 
      )
      # could be events channel too
      # ConversationsChannel.broadcast_to("#{self.app.key}-#{self.asignee.email}", {} )
    end

    part
  end

  def assign_user(user)
    self.assignee = user
    self.save
  end

end
