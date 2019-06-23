class Conversation < ApplicationRecord
  belongs_to :app
  belongs_to :assignee, class_name: 'Agent', optional: true
  belongs_to :main_participant, class_name: "AppUser", optional: true #, foreign_key: "user_id"
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

  def toggle_priority
    self.priority = !self.priority
    self.save
  end

  def add_message(opts={})
    part = process_message_part(opts)
    part.save
    
    if part.errors.blank?
      notify_subscribers(part)
    end

    part
  end

  def add_private_note(opts={})
    part = process_message_part(opts)
    part.private_note = true
    part.save

    if part.errors.blank?
      notify_subscribers(part)
    end

    part
  end

  def process_message_part(opts)
    part          = self.messages.new
    part.authorable = opts[:from]
    #part.app_user = opts[:from]
    part.message  = opts[:message]
    part.message_source = opts[:message_source] if opts[:message_source]
    part.email_message_id = opts[:email_message_id]
    part
  end

  def notify_subscribers(part)
    subscribers = ConversationsChannel.broadcast_to("#{self.app.key}-#{self.id}", 
      part.as_json
    )
    logger.info("subscribers: #{subscribers}")
    # could be events channel too
    # ConversationsChannel.broadcast_to("#{self.app.key}-#{self.asignee.email}", {} )
  end


  def assign_user(user)
    self.assignee = user
    self.save
  end

  #TODO: give use choose this logic
  def add_default_assigne
    self.assignee = self.app.agents.first
  end

end
