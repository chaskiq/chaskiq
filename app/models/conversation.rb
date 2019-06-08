class Conversation < ApplicationRecord
  belongs_to :app
  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :main_participant, class_name: "AppUser" #, foreign_key: "user_id"
  has_many :messages, class_name: "ConversationPart", dependent: :destroy

  include AASM

  before_create :add_default_assigne

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
    part.message_source = opts[:message_source] if opts[:message_source]
    part.email_message_id = opts[:email_message_id]
    part.save
    
    if part.errors.blank?
      subscribers = ConversationsChannel.broadcast_to("#{self.app.key}-#{self.id}", 
        part.as_json(only: [:id, :message, :conversation_id, :read_at], methods: [:app_user]) 
      )
      logger.info("subscribers: #{subscribers}")
      # could be events channel too
      # ConversationsChannel.broadcast_to("#{self.app.key}-#{self.asignee.email}", {} )
    end

    part
  end

  def assign_user(user)
    self.assignee = user
    self.save
  end

  #TODO: give use choose this logic
  def add_default_assigne
    self.assignee = self.app.admin_users.first
  end

end
