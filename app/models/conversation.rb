# frozen_string_literal: true

class Conversation < ApplicationRecord
  include Eventable
  include AASM
  include Tokenable

  include AuditableBehavior

  belongs_to :app
  belongs_to :assignee, class_name: "Agent", optional: true
  belongs_to :main_participant, class_name: "AppUser", optional: true # , foreign_key: "user_id"
  # has_one :conversation_source, dependent: :destroy
  has_many :messages, class_name: "ConversationPart", dependent: :destroy_async
  has_many :conversation_channels, dependent: :destroy_async
  has_many :conversation_part_channel_sources, through: :messages
  has_one :latest_message, -> { order("id desc") },
          class_name: "ConversationPart"

  has_one :public_latest_message, -> { visibles.order("id desc") },
          class_name: "ConversationPart"

  acts_as_taggable_on :tags

  accepts_nested_attributes_for :conversation_channels

  before_create :add_default_assigne
  after_create :convert_visitor_to_lead, if: :visitor_participant?

  after_create :add_created_event

  attr_accessor :initiator

  aasm column: :state do
    state :opened, initial: true
    state :closed

    event :reopen, after: :add_reopened_event do
      transitions from: :closed, to: :opened
    end

    event :close,
          before: :touch_closed_at,
          after: :add_closed_event do
      transitions from: :opened, to: :closed
    end
  end

  def broadcast_key
    "#{app.key}-#{main_participant.session_id}"
  end

  def touch_closed_at
    touch(:closed_at)
  end

  def convert_visitor_to_lead
    main_participant.become_lead!
  end

  def visitor_participant?
    main_participant.is_a?(Visitor)
  end

  def add_conversation_assigned
    events.log(action: :conversation_assigned)
    notify_conversation_state_update
  end

  def add_started_event
    events.log(action: :conversation_started)
  end

  def add_created_event
    events.log(action: :conversation_opened)
  end

  def add_closed_event
    events.log(action: :conversation_closed)
    notify_conversation_state_update
  end

  def notify_conversation_state_update
    data = as_json(methods: [:assignee])

    EventsChannel.broadcast_to(
      app.key,
      type: "conversations:update_state",
      data: data
    )

    MessengerEventsChannel.broadcast_to(
      broadcast_key,
      type: "conversations:update_state",
      data: data
    )
  end

  def add_reopened_event
    events.log(action: :conversation_reopened)
    notify_conversation_state_update
  end

  def first_user_interaction
    events.log(action: :first_comment_from_user)
  end

  def log_prioritized
    events.log(action: :conversation_prioritized)
    notify_conversation_state_update
  end

  def toggle_priority
    self.priority = !priority
    log_prioritized if save
  end

  def add_message(opts = {})
    part = process_message_part(opts)

    ActiveRecord::Base.transaction do
      part.save
    end

    part.notify_to_channels if part.errors.blank?
    part
  end

  def add_private_note(opts = {})
    part = process_message_part(opts.merge!(private_note: true))

    ActiveRecord::Base.transaction do
      part.save
    end

    part.notify_to_channels if part.errors.blank?
    part
  end

  def add_message_event(opts = {})
    part = messages.new(authorable: app.agent_bots.first)
    part.event = {
      action: opts[:action],
      data: opts[:data]
    }

    add_part_channel(part, opts)
    part.notify_to_channels if part.save
    part
  end

  def process_message_part(opts)
    part = messages.new
    # part.app_user = opts[:from]
    handle_part_details(part, opts)

    part.private_note = opts[:private_note]
    part.message_source = opts[:message_source] if opts[:message_source]
    part.email_message_id = opts[:email_message_id]

    add_part_channel(part, opts)
    part
  end

  def add_part_channel(part, opts)
    if opts[:provider].present? && opts[:message_source_id].present?
      part.conversation_part_channel_sources.new({
                                                   provider: opts[:provider],
                                                   message_source_id: opts[:message_source_id]
                                                 })
    end
  end

  def assign_user(user)
    return if assignee.present? && assignee.id === user.id

    self.assignee = user
    if save
      add_message_event(
        action: "assigned",
        data: {
          name: user.name,
          id: user.id,
          email: user.email
        }
      )

      add_conversation_assigned
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
    unless has_user_visible_comment?
      update_column(:latest_user_visible_comment_at, Time.zone.now)
      first_user_interaction
    end
  end

  def has_user_visible_comment?
    latest_user_visible_comment_at.present?
  end

  private

  def handle_part_details(part, opts)
    part.authorable = opts[:from]
    part.step_id = opts[:step_id]
    part.trigger_id = opts[:trigger_id]
    part.check_assignment_rules = opts[:check_assignment_rules]
    part.controls = opts[:controls] if opts[:controls].present?
    part.message  = opts[:message] if opts[:message].present?
  end
end
