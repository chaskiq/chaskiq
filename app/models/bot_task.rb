# frozen_string_literal: true

class BotTask < Message
  # acts_as_list scope: %i[app_id]

  belongs_to :app

  has_many :metrics, as: :trackable, dependent: :destroy_async

  before_create :initialize_default_controls

  store_accessor :settings,
                 %i[scheduling urls outgoing_webhook paths user_type bot_type]

  def self.ransackable_attributes(auth_object = nil)
    ["name"]
  end

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

  def enabled?
    state == "enabled"
  end

  def disabled?
    enabled?
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

        data = {
          type: "triggers:receive",
          data: {
            trigger: bot_task,
            step: bot_task.paths.first["steps"].first
          }
        }.as_json

        MessengerEventsChannel.broadcast_to(key, data)

        bot_task.broadcast_update_to app, user,
                                     target: "chaskiq-custom-events",
                                     partial: "messenger/custom_event",
                                     locals: { data: data }

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

  attr_accessor :new_path_title, :current_path

  def bot_paths_objects
    return @bot_paths_objects = [] if paths.blank?

    @bot_paths_objects ||= (paths.map { |o| BotPath.new(o) } || [])
  end

  def bot_paths_objects=(attrs)
    @bot_paths_objects = attrs.map { |o| BotPath.new(o) }
  end

  def bot_paths_objects_attributes=(attributes)
    bot_paths ||= []
    attributes.each do |_i, params|
      # params["follow_actions_attributes"] = params.delete("followActions") if params["follow_actions_attributes"].blank?
      bot_paths.push(BotPath.new(params))
    end
    self.paths = bot_paths.as_json
  end

  def as_json(options = nil)
    result = super({
      only: %i[id settings name scheduled_at scheduled_to],
      methods: %i[id settings name scheduled_at scheduled_to]
    }
             .merge(options || {})
    )
    result[:id] = id.to_s
    result
  end
end

class BotPath
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :id, :title
  attr_reader :follow_actions

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end

  def steps
    @steps || []
  end

  def steps=(attrs)
    @steps = if attrs
               attrs.map do |o|
                 BotPathStep.new(o)
               end
             else
               []
             end
  end

  def steps_attributes=(attrs)
    @steps ||= []
    attrs.each do |_i, params|
      @steps.push(BotPathStep.new(params))
    end
    @steps
    # @steps = attrs ? attrs.map { |o| BotPathStep.new(o) } : []
  end

  def follow_actions=(attrs)
    @follow_actions = attrs ? attrs.map { |o| FollowAction.new(o) } : []
  end

  def follow_actions_attributes=(attrs)
    @follow_actions = attrs.keys.map { |o| FollowAction.new(attrs[o]) }
  end
end

class FollowAction
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :key, :name, :value, :_destroy

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end

class BotPathStep
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :id, :type, :step_uid, :position

  def messages
    @messages || []
  end

  def messages=(attrs)
    @messages = attrs ? attrs.map { |o| BotPathStepMessage.new(o) } : []
  end

  def messages_attributes=(attrs)
    @messages ||= []
    attrs.each do |_i, params|
      @messages.push(BotPathStepMessage.new(params))
    end
    @messages
  end

  def controls
    @controls || nil
  end

  def controls=(attrs)
    @controls = BotPathStepControl.new(attrs)
  end

  def controls_attributes=(attrs)
    @controls = BotPathStepControl.new(attrs)
    # attrs.each do |i, params|
    #  binding.pry
    # @controls.push(BotPathStepControl.new(params))
    # end
    # @controls
  end

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end
end

class BotPathStepControl
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :type, :label, :app_package, :_destroy, :wait_for_input

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end

  def schema
    @schema || []
  end

  def schema=(attrs)
    return if attrs.blank?

    # HACK: for malformed data on json :P
    attrs = attrs.filter { |o| o["type"] != "messages" }
    # end of hack

    @schema = attrs.map do |o|
      o.delete("errors")
      BotPathStepSchema.new(o)
    end
  end

  def schema_attributes=(attrs)
    @schema ||= []
    attrs.each do |_i, params|
      params.delete("errors")
      @schema.push(BotPathStepSchema.new(params))
    end
    @schema
  end
end

class BotPathStepSchema
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :id,
                :label,
                :disabled,
                :text,
                :items,
                :element,
                :next_step_uuid,
                :type,
                :hint,
                :placeholder,
                :style,
                :value,
                :size,
                :align,
                :variant,
                :app_package,
                :width,
                :height,
                :url,
                # :controls,
                # :messages,
                :step_uid,
                :name,
                :_destroy

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end

  attr_reader :action

  def action=(attrs)
    @action = BotPathStepSchemaAction.new(attrs)
  end

  def action_attributes=(attrs)
    @action = BotPathStepSchemaAction.new(attrs)
  end
end

class BotPathStepSchemaAction
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :url, :type
end

class BotPathStepMessage
  include ActiveModel::AttributeAssignment
  include ActiveModel::Model
  include ActiveModel::Validations
  attr_accessor :type, :app_user, :html_content, :serialized_content, :_destroy

  def marked_for_destruction?
    false
  end

  def new_record?
    true
  end

  def controls
    @controls || nil
  end

  def controls=(attrs)
    @controls = BotPathStepControl.new(attrs)
  end

  def controls_attributes=(attrs)
    @controls = BotPathStepControl.new(attrs)
  end
end
