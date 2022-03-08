# frozen_string_literal: true

class BotTask < Message
  # acts_as_list scope: %i[app_id]

  belongs_to :app

  has_many :metrics, as: :trackable, dependent: :destroy_async

  before_create :initialize_default_controls

  store_accessor :settings,
                 %i[scheduling urls outgoing_webhook paths user_type bot_type]

  scope :enabled, -> { where(state: "enabled") }
  scope :disabled, -> { where(state: "disabled") }

  scope :for_new_conversations,
        -> { where("settings->>'bot_type' = ?", "new_conversations") }
  scope :for_outbound, -> { where("settings->>'bot_type' = ?", "outbound") }
  scope :for_leads, -> { where("settings->>'user_type' = ?", "leads") }
  scope :for_users, -> { where("settings->>'user_type' = ?", "users") }
  scope :inside_office,
        -> { where("settings->>'scheduling' = ?", "inside_office") }
  scope :outside_office,
        -> { where("settings->>'scheduling' = ?", "outside_office") }

  alias_attribute :title, :name

  scope :availables_for,
        lambda { |user|
          enabled
            .joins(
              "left outer join metrics
      on metrics.trackable_type = 'Message'
      AND metrics.trackable_id = campaigns.id
      AND metrics.app_user_id = #{user.id}"
            )
            .where(metrics: { id: nil })
        }

  def initialize_default_controls
    # self.segments = default_type_segments unless segments.present?

    return self unless bot_type == "new_conversations"

    self.paths = default_new_conversation_path if paths.blank?
  end

  def default_new_conversation_path
    [
      "title" => "default step",
      "id" => "3418f148-6c67-4789-b7ae-8fb3758a4cf9",
      "steps" => [
        {
          "type" => "messages",
          "controls" => {
            "type" => "ask_option",
            "schema" => [
              {
                "id" => "0dc3559e-4eab-43d9-ab60-7325219a3f6f",
                "label" => "see more?",
                "element" => "button",
                "next_step_uuid" => "2bff4dec-f8c1-4a8b-9601-68c66356ba06"
              },
              {
                "type" => "messages",
                "controls" => {
                  "type" => "ask_option",
                  "schema" => [
                    {
                      "id" => "0dc3559e-4eab-43d9-ab60-7325219a3f6f",
                      "label" => "write here",
                      "element" => "button"
                    }
                  ]
                },
                "messages" => [],
                "step_uid" => "30e48aed-19c0-4b62-8afa-9a0392deb0b8"
              }
            ],
            "wait_for_input" => true
          },
          "messages" => [],
          "step_uid" => "30e48aed-19c0-4b62-8afa-9a0392deb0b8"
        }
      ]
    ]
  end

  def available_segments
    segment = app.segments.new
    segment.assign_attributes(predicates: segments)
    app_users = segment.execute_query.availables
  end

  # consumed
  def available_for_user?(user)
    comparator = SegmentComparator.new(user: user, predicates: segments)

    comparator.compare # && metrics.where(app_user_id: user.id).blank?
  rescue ActiveRecord::RecordNotFound
    false
  end

  def self.send_chain(methods)
    methods.inject(self, :send)
  end

  def self.handle_availability_options(availability)
    case availability
    when nil
      nil
    when true
      :inside_office
    when false
      :outside_office
    end
  end

  # idea 1: just return a collection of predicates and do it in the client
  # TODO: think how could we set this on client side effectively
  # idea 2: backend implementation , the following code
  def self.get_welcome_bots_for_user(user, availability)
    selected = nil
    meths = [
      :enabled,
      :ordered,
      handle_availability_options(availability)
    ].compact
    for_new_conversations
      .send_chain(meths)
      .each do |bot_task|
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

    availability = app.in_business_hours?(Time.zone.now)
    meths = [:for_outbound, handle_availability_options(availability)].compact

    app
      .bot_tasks
      .send_chain(meths)
      .availables_for(user)
      .each do |bot_task|
        next if bot_task.blank? || !bot_task.available_for_user?(user)

        MessengerEventsChannel.broadcast_to(
          key,
          {
            type: "triggers:receive",
            data: {
              trigger: bot_task,
              step: bot_task.paths.first["steps"].first
            }
          }.as_json
        )

        user.metrics.create(trackable: bot_task, action: "bot_tasks.delivered")

        ret = true

        break
      end

    ret
  end

  def register_metric(user, data:, options:)
    label = data["label"]

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

  def stats_fields
    [
      add_stat_field(
        name: "DeliverRateCount",
        label: "DeliverRateCount",
        keys: [
          { name: "open", color: "#F4F5F7" },
          { name: "close", color: "#0747A6" }
        ]
      )
    ]
  end

  def self.duplicate(record)
    create(record.dup)
  end

  attr_accessor :new_path_title

  def bot_paths_objects
    @bot_paths_objects ||= (paths.map { |o| BotPath.new(o) } || [])
  end

  def bot_paths_objects=(attrs)
    @bot_paths_objects = attrs.map { |o| BotPath.new(o) }
  end

  def bot_paths_objects_attributes=(attributes)
    # binding.pry
    # array = attributes.keys.map { |o| attributes[o] }
    # self.paths = JSON.parse(array.map { |o| ScheduleRecord.new(o) }.to_json)
    # array.map{|o| ScheduleRecord.new(o) }
  end
end

class BotPath
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :id, :steps, :title, :follow_actions

  def steps=(attrs)
    @steps = attrs ? attrs.map { |o| BotPathStep.new(o) } : []
  end

  def steps_attributes=(attrs)
    @steps = attrs ? attrs.map { |o| BotPathStep.new(o) } : []
  end
end

class BotPathStep
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :type, :controls, :messages, :step_uid

  def messages=(attrs)
    @messages = attrs ? attrs.map { |o| BotPathStepMessage.new(o) } : []
  end

  def messages
    @messages || []
  end

  def controls
    @controls || []
  end

  def controls=(attrs)
    @controls = BotPathStepControl.new(attrs)
  end
end

class BotPathStepControl
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :type, :schema, :messages, :wait_for_input, :label

  def schema
    @schema || []
  end

  def schema=(attrs)
    @schema = attrs.map { |o| BotPathStepSchema.new(o) }
  end

  def messages
    @messages ||= []
  end

  def messages=(attrs)
    @messages = attrs.map { |o| BotPathStepMessage.new(o) }
  end
end

class BotPathStepSchema
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :id,
                :label,
                :element,
                :next_step_uuid,
                :type,
                :controls,
                :messages,
                :step_uid
  #              :,
  #              :messages
end

class BotPathStepMessage
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  attr_accessor :app_user, :html_content, :serialized_content
end
