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
  has_many :messages, class_name: "ConversationPart", dependent: :destroy

  has_many :message_blocks, through: :messages, source: :message_block

  has_many :conversation_channels, dependent: :destroy
  has_many :conversation_part_channel_sources, through: :messages
  has_one :latest_message, -> { order("id desc") },
          class_name: "ConversationPart", dependent: nil

  has_one :public_latest_message, -> { visibles.order("id desc") },
          class_name: "ConversationPart", dependent: nil

  acts_as_taggable_on :tags

  accepts_nested_attributes_for :conversation_channels

  before_create :add_default_assigne
  after_create :convert_visitor_to_lead, if: :visitor_participant?

  def self.ransackable_attributes(auth_object = nil)
    %w[admins app_id assignee_id blocked blocked_reason closed_at created_at first_agent_reply id id_value key latest_admin_visible_comment_at latest_update_at latest_user_visible_comment_at main_participant_id parts_count priority read_at reply_count state subject updated_at]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[app assignee audits base_tags conversation_channels conversation_part_channel_sources events latest_message main_participant message_blocks messages public_latest_message tag_taggings taggings tags]
  end

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

  def toggle_state
    meth = state == "opened" ? :close! : :reopen!
    send(meth)
  end

  def notify_conversation_state_update
    data = { type: "conversations:update_state",
             data: as_json(methods: [:assignee]) }

    EventsChannel.broadcast_to(app.key, data)

    MessengerEventsChannel.broadcast_to(
      broadcast_key, data
    )

    broadcast_update_to app, main_participant.id,
                        target: "chaskiq-custom-events",
                        partial: "messenger/custom_event",
                        locals: { data: data }

    broadcast_render_to app, main_participant.id,
                        partial: "messenger/conversations/state_update",
                        locals: {
                          app: app,
                          conversation: self,
                          user: main_participant
                        }
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

    part.trigger_init = opts[:trigger_init]
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

  def add_trigger_message(trigger)
    author = app.agent_bots.first
    step = trigger.paths.first&.with_indifferent_access&.[]("steps")&.find do |o|
      o["messages"]&.any?
    end

    message = step[:messages].first

    add_message(
      step_id: step[:step_uid],
      trigger_id: trigger.id,
      from: author,
      trigger_init: true,
      message: {
        html_content: message[:html_content],
        serialized_content: message[:serialized_content],
        text_content: message[:html_content]
      },
      controls: message[:controls]
    )
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
    first_user_interaction unless has_user_visible_comment?
    update_column(:latest_user_visible_comment_at, Time.zone.now)
  end

  def has_user_visible_comment?
    latest_user_visible_comment_at.present?
  end

  def block(msg = nil)
    self.blocked = true
    self.blocked_reason = msg
  end

  def block!(msg = nil)
    block(msg)
    save
  end

  # used for agents
  def notify_typing(author = nil)
    author = app.agents.bots.first if author.blank?
    key = "#{app.key}-#{main_participant.session_id}"
    data = {
      type: "conversations:typing",
      data: {
        conversation: self.key,
        author: {
          name: author.name
        }
      }
    }.as_json

    MessengerEventsChannel.broadcast_to(key, data)

    broadcast_update_to app, main_participant.id,
                        target: "chaskiq-custom-events",
                        partial: "messenger/custom_event",
                        locals: { data: data }
  end

  def notify_typing_to_agents
    broadcast_update_to app, :conversations,
                        target: nil,
                        targets: ".typing-#{key}",
                        partial: "apps/conversations/typing",
                        locals: { key: key }
  end

  def notify_typing_to_user
    broadcast_update_to app, main_participant.id,
                        target: nil,
                        targets: ".typing-#{key}",
                        partial: "messenger/conversations/typing",
                        locals: { key: key }
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
