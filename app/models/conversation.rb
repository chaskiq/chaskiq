class Conversation < ApplicationRecord
  include Eventable
  include AASM
  include Tokenable

  belongs_to :app
  belongs_to :assignee, class_name: 'Agent', optional: true
  belongs_to :main_participant, class_name: "AppUser", optional: true #, foreign_key: "user_id"
  has_many :messages, class_name: "ConversationPart", dependent: :destroy

  after_create :convert_visitor_to_lead , if: :visitor_participant?

  before_create :add_default_assigne
  after_create :add_created_event

  attr_accessor :initiator

  aasm column: :state do
    state :opened, :initial => true
    state :closed

    event :reopen , after: :add_reopened_event do
      transitions :from => :closed, :to => :opened
    end

    event :close, after: :add_closed_event do
      transitions :from => :opened, :to => :closed
    end
  end

  def convert_visitor_to_lead
    main_participant.become_lead!
  end

  def visitor_participant?
    self.main_participant.is_a?(Visitor) 
  end

  def add_created_event
    events.log(action: :conversation_opened)
  end

  def add_closed_event
    events.log(action: :conversation_closed)
  end

  def add_reopened_event
    events.log(action: :conversation_reopened)
  end

  def toggle_priority
    self.priority = !self.priority
    self.save
  end

  def add_message(opts={})
    part = process_message_part(opts)
    part.save
    
    if part.errors.blank?
      part.notify_to_channels
    end

    part
  end

  def add_message_event(opts={})
    part = self.messages.new(authorable: self.app.agent_bots.first )
    part.event = {
      action: opts[:action],
      data: opts[:data]
    }
    
    if part.save 
      part.notify_to_channels
    end

    part
  end

  def add_private_note(opts={})
    part = process_message_part(opts.merge!(private_note: true))
    part.save

    if part.errors.blank?
      part.notify_to_channels
    end

    part
  end

  def process_message_part(opts)
    part          = self.messages.new
    part.authorable = opts[:from]
    part.check_assignment_rules = opts[:check_assignment_rules]
    #part.app_user = opts[:from]

    part.step_id = opts[:step_id] unless opts[:step_id].blank?
    part.trigger_id = opts[:trigger_id] unless opts[:trigger_id].blank?

    part.controls = opts[:controls] if opts[:controls].present?
    part.message  = opts[:message] if opts[:message].present?

    part.private_note = opts[:private_note]
    part.message_source = opts[:message_source] if opts[:message_source]
    part.email_message_id = opts[:email_message_id]
    part
  end

  def assign_user(user)
    self.assignee = user
    if self.save
      self.add_message_event({
        action: "assigned",
        data: {
          name: user.name,
          id: user.id,
          email: user.email
        }
      })
    end
  end

  def add_default_assigne
    if @initiator.is_a?(Agent) && self.assignee.blank?
      self.assignee = @initiator
      return
    end
  end

  def check_conditions
    part = self.messages.last
    part.check_assignment_rules
  end

end
