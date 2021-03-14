# frozen_string_literal: true

class BotTask < Message
  # acts_as_list scope: %i[app_id]

  belongs_to :app

  has_many :metrics, as: :trackable, dependent: :destroy_async

  before_create :initialize_default_controls

  store_accessor :settings, %i[
    scheduling
    urls
    outgoing_webhook
    paths
    user_type
    bot_type
  ]

  scope :enabled, -> { where(state: 'enabled') }
  scope :disabled, -> { where(state: 'disabled') }

  scope :for_new_conversations, lambda {
    # where(type: 'leads')
    where("settings->>'bot_type' = ?", 'new_conversations')
  }
  scope :for_outbound, lambda {
    # where(type: 'users')
    where("settings->>'bot_type' = ?", 'outbound')
  }
  scope :for_leads, lambda {
    # where(type: 'leads')
    where("settings->>'user_type' = ?", 'leads')
  }
  scope :for_users, lambda {
    # where(type: 'users')
    where("settings->>'user_type' = ?", 'users')
  }

  alias_attribute :title, :name

  scope :availables_for, lambda { |user|
    enabled.joins("left outer join metrics
      on metrics.trackable_type = 'Message'
      AND metrics.trackable_id = campaigns.id
      AND metrics.app_user_id = #{user.id}")
           .where('metrics.id is null')
  }

  def initialize_default_controls
    unless segments.present?
      self.segments = default_type_segments
    end

    return self unless bot_type == 'new_conversations'

    self.paths = default_new_conversation_path if paths.blank?
  end

  def default_type_segments
    [
      { 'type' => 'match', 'value' => 'and', 'attribute' => 'match', 'comparison' => 'and' },
      { 'type' => 'string', 'value' => 'AppUser', 'attribute' => 'type', 'comparison' => 'eq' }
    ]
  end

  def default_new_conversation_path
    [
      'title' => 'default step',
      'id' => '3418f148-6c67-4789-b7ae-8fb3758a4cf9',
      'steps' => [
        {
          'type' => 'messages',
          'controls' => {
            'type' => 'ask_option',
            'schema' => [
              { 'id' => '0dc3559e-4eab-43d9-ab60-7325219a3f6f',
                'label' => 'see more?',
                'element' => 'button',
                'next_step_uuid' => '2bff4dec-f8c1-4a8b-9601-68c66356ba06' },
              { 'type' => 'messages',
                'controls' => {
                  'type' => 'ask_option',
                  'schema' => [
                    { 'id' => '0dc3559e-4eab-43d9-ab60-7325219a3f6f',
                      'label' => 'write here',
                      'element' => 'button' }
                  ]
                },
                'messages' => [],
                'step_uid' => '30e48aed-19c0-4b62-8afa-9a0392deb0b8' }
            ],
            'wait_for_input' => true
          },
          'messages' => [],
          'step_uid' => '30e48aed-19c0-4b62-8afa-9a0392deb0b8'
        }
      ]
    ]
  end

  def add_default_predicate
    self.segments = default_segments unless segments.present?
    self.settings = {} unless settings.present?
  end

  def available_segments
    segment = app.segments.new
    segment.assign_attributes(predicates: segments)
    app_users = segment.execute_query.availables
  end

  # consumed
  def available_for_user?(user)
    comparator = SegmentComparator.new(
      user: user,
      predicates: segments
    )

    comparator.compare # && metrics.where(app_user_id: user.id).blank?
  rescue ActiveRecord::RecordNotFound
    false
  end

  # idea 1: just return a collection of predicates and do it in the client
  # TODO: think how could we set this on client side effectively
  # idea 2: backend implementation , the following code
  def self.get_welcome_bots_for_user(user)
    selected = nil
    for_new_conversations.enabled.ordered.each do |bot_task|
      if bot_task.available_for_user?(user)
        selected = bot_task
        break
      end
    end
    selected
  end

  def self.broadcast_task_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"
    ret = nil

    app.bot_tasks.for_outbound.availables_for(user).each do |bot_task|
      next if bot_task.blank? || !bot_task.available_for_user?(user)

      MessengerEventsChannel.broadcast_to(key, {
        type: 'triggers:receive',
        data: {
          trigger: bot_task,
          step: bot_task.paths.first['steps'].first
        }
      }.as_json)

      user.metrics.create(
        trackable: bot_task,
        action: 'bot_tasks.delivered'
      )

      ret = true

      break
    end

    ret
  end

  def register_metric(user, data:, options:)
    label = data['label']

    user.metrics.create(
      trackable: self,
      action: "bot_tasks.actions.#{label}",
      data: options
    )
  end

  def log_action(action)
    user.metrics.create(
      trackable: bot_task,
      action: "bot_tasks.actions.#{action}"
    )
  end

  def default_segments
    default_predicate = { type: 'match',
                          attribute: 'match',
                          comparison: 'and',
                          value: 'and' }.with_indifferent_access

    user_predicate = {
      attribute: 'type',
      comparison: 'eq',
      type: 'string',
      value: 'AppUser'
    }.with_indifferent_access

    lead_predicate = {
      attribute: 'type',
      comparison: 'eq',
      type: 'string',
      value: 'Lead'
    }.with_indifferent_access

    if user_type == 'leads'
      [default_predicate, lead_predicate]
    else
      [default_predicate, user_predicate]
    end
  end

  def stats_fields
    [
      add_stat_field(
        name: 'DeliverRateCount',
        label: 'DeliverRateCount',
        keys: [{ name: 'open', color: '#F4F5F7' },
          { name: 'close', color: '#0747A6' }]
        )
    ]
  end

  def self.duplicate(record)
    create(record.dup)
  end
end
