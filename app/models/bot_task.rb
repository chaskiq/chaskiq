# frozen_string_literal: true

class BotTask < ApplicationRecord
  self.inheritance_column = nil

  belongs_to :app

  has_many :metrics, as: :trackable, dependent: :destroy

  before_create :defaults

  store_accessor :settings, %i[
    scheduling
    urls
    outgoing_webhook
  ]

  scope :enabled, -> { where(state: 'enabled') }
  scope :disabled, -> { where(state: 'disabled') }

  scope :for_leads, -> { where(type: 'leads') }
  scope :for_users, -> { where(type: 'users') }

  scope :availables_for, lambda { |user|
    enabled.joins("left outer join metrics
      on metrics.trackable_type = 'BotTask'
      AND metrics.trackable_id = bot_tasks.id
      AND metrics.app_user_id = #{user.id}").where('metrics.id is null')
  }

  def segments
    predicates
  end

  def segments=(data)
    self.predicates = data
  end

  def defaults
    self.predicates = default_segments unless predicates.present?
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

    comparator.compare #&& metrics.where(app_user_id: user.id).blank?
    
  rescue ActiveRecord::RecordNotFound
    false
  end

  def self.broadcast_task_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"
    ret = nil
    app.bot_tasks.availables_for(user).each do |bot_task|

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
    label  = data['label']
    
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

  # def stats_fields
  #  [
  #    {name: "DeliverRateCount", label: "DeliverRateCount", keys: [{name: "send", color: "#444"}, {name: "open", color: "#ccc"}] },
  #    {name: "ClickRateCount", label: "ClickRateCount", keys: [{name: "send" , color: "#444"}, {name: "click", color: "#ccc"}] },
  #    {name: "BouncesRateCount", label: "BouncesRateCount", keys: [{name: "send", color: "#444"}, {name: "bounces", color: "#ccc"}]},
  #    {name: "ComplaintsRate", label: "ComplaintsRate", keys: [{name: "send", color: "#444"}, {name: "complaints", color: "#ccc"}]}
  #  ]
  # end

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

    type == 'leads' ? 
    [default_predicate, lead_predicate] : 
    [default_predicate, user_predicate]
  end

  def stats_fields
    [
      { 
        name: 'DeliverRateCount', 
        label: 'DeliverRateCount', 
        keys: [
          { name: 'send', color: '#444' }, 
          { name: 'open', color: '#ccc' }] 
        }
    ]
  end
end
