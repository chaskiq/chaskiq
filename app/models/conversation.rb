# frozen_string_literal: true

class Conversation < ApplicationRecord
  include Eventable
  include AASM
  include Tokenable

  belongs_to :app
  belongs_to :assignee, class_name: 'Agent', optional: true
  belongs_to :main_participant, class_name: 'AppUser', optional: true # , foreign_key: "user_id"
  #has_one :conversation_source, dependent: :destroy
  has_many :messages, class_name: 'ConversationPart', dependent: :destroy
  has_many :conversation_channels, dependent: :destroy
  has_many :conversation_part_channel_sources, through: :messages
  has_one :latest_message,  -> { order('id desc') }, class_name: 'ConversationPart'

  #TODO : remove this logic
  accepts_nested_attributes_for :conversation_channels

  after_create :convert_visitor_to_lead, if: :visitor_participant?

  before_create :add_default_assigne
  after_create :add_created_event

  attr_accessor :initiator

  aasm column: :state do
    state :opened, initial: true
    state :closed

    event :reopen, after: :add_reopened_event do
      transitions from: :closed, to: :opened
    end

    event :close, after: :add_closed_event do
      transitions from: :opened, to: :closed
    end
  end

  def convert_visitor_to_lead
    main_participant.become_lead!
  end

  def visitor_participant?
    main_participant.is_a?(Visitor)
  end

  def add_started_event
    events.log(action: :conversation_started)
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
    self.priority = !priority
    save
  end

  def add_message(opts = {})
    part = process_message_part(opts)
    part.save

    part.notify_to_channels if part.errors.blank?

    part
  end

  def add_message_event(opts = {})
    part = messages.new(authorable: app.agent_bots.first)
    part.event = {
      action: opts[:action],
      data: opts[:data]
    }

    part.notify_to_channels if part.save

    part
  end

  def add_private_note(opts = {})
    part = process_message_part(opts.merge!(private_note: true))
    part.save

    part.notify_to_channels if part.errors.blank?

    part
  end

  def process_message_part(opts)
    part = messages.new
    part.authorable = opts[:from]
    part.check_assignment_rules = opts[:check_assignment_rules]
    # part.app_user = opts[:from]

    part.step_id = opts[:step_id] unless opts[:step_id].blank?
    part.trigger_id = opts[:trigger_id] unless opts[:trigger_id].blank?

    part.controls = opts[:controls] if opts[:controls].present?
    part.message  = opts[:message] if opts[:message].present?

    part.private_note = opts[:private_note]
    part.message_source = opts[:message_source] if opts[:message_source]
    part.email_message_id = opts[:email_message_id]
    
    part.conversation_part_channel_sources.new({
      provider: opts[:provider], 
      message_source_id: opts[:message_source_id]
    }) if opts[:provider].present? && opts[:message_source_id].present?
    
    part
  end

  def assign_user(user)
    return if self.assignee.present? && self.assignee.id === user.id
    self.assignee = user
    if save
      add_message_event(
        action: 'assigned',
        data: {
          name: user.name,
          id: user.id,
          email: user.email
        }
      )
    end
  end

  def add_default_assigne
    if @initiator.is_a?(Agent) && assignee.blank?
      self.assignee = @initiator
      nil
    end
  end

  def check_conditions
    part = messages.last
    part.check_assignment_rules
  end

  def update_first_time_reply
    return if first_agent_reply.present?

    now = Time.zone.now
    update(first_agent_reply: now)
    diff = (now.to_date - created_at.to_date).to_f * 24
    AppIdentity.new(app.key).first_response_time.set(diff)
  end

  def update_latest_user_visible_comment_at
    update(latest_user_visible_comment_at: Time.zone.now)
  end
end
