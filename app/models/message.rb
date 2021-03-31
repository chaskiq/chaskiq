# frozen_string_literal: true

class Message < ApplicationRecord
  self.table_name = 'campaigns'

  belongs_to :app

  has_many :metrics, as: :trackable
  has_many_attached :attachments

  has_many :conversation_parts

  acts_as_list scope: %i[app_id type]

  attr_accessor :step

  validates :name, presence: :true
  validates :html_content, presence: true, if: :template_step?

  scope :enabled, -> { where(state: 'enabled') }
  scope :disabled, -> { where(state: 'disabled') }
  scope :ordered, -> { order('position asc') }
  scope :in_time, -> { where(['scheduled_at <= ? AND scheduled_to >= ?', Date.today, Date.today]) }
  # before_save :detect_changed_template
  before_create :add_default_predicate
  before_create :initial_state

  scope :availables_for, lambda { |user|
    enabled.in_time
           .joins("left outer join metrics
      on metrics.trackable_type = 'Message'
      AND metrics.trackable_id = campaigns.id
      AND metrics.app_user_id = #{user.id}
      AND settings->'hidden_constraints' ? metrics.action")
           .where('metrics.id is null')
  }

  def available_for_user?(user)
    comparator = SegmentComparator.new(
      user: user,
      predicates: segments
    )
    comparator.compare # && metrics.where(app_user_id: user.id).blank?
  rescue ActiveRecord::RecordNotFound
    false
  end

  def show_notification_for(user)
    if available_for_user?(user)
      metrics.create(
        app_user: user,
        trackable: self,
        action: 'viewed',
        message_id: user.id
      )
      self
    end
  end

  def self.allowed_types
    %w[campaigns user_auto_messages tours banners]
  end

  def enabled?
    state == 'active'
  end

  def disabled?
    state != 'active'
  end

  def enable!
    update_attribute(:state, 'enabled')
  end

  def disable!
    update_attribute(:state, 'disabled')
  end

  def initial_state
    return if state.present?

    self.state = 'disabled'
  end

  def default_type_segments
    [
      { 'type': 'match', 'value': 'and', 'attribute': 'match', 'comparison': 'and' },
      { 'type': 'string', 'value': ['AppUser'], 'attribute': 'type', 'comparison': 'in' }
    ]
  end

  def add_default_predicate
    
    return if segments.present? && segments.any?

    self.segments = [] unless segments.present?

    segments << {
      type: 'match',
      attribute: 'match',
      comparison: 'and',
      value: 'and'
    }

    segments << default_type_segments
  end

  def self.type_predicate_for(type_predicate)
    # AppUser, Lead, Visitor
    [{
      value: type_predicate,
      type: 'string',
      attribute: 'type',
      comparison: 'in'
    }]
  end

  def self.infix(filter)
    Arel::Nodes::InfixOperation.new('@>',
                                    arel_table[:segments],
                                    Arel::Nodes.build_quoted(BotTask.type_predicate_for(filter).to_json.to_s))
  end

  def step_1?
    step == 1
  end

  def template_step?
    step == 'template'
  end

  def compiled_template_for(subscriber)
    html = mustache_template_for(subscriber)
  end

  def available_segments
    segment = app.segments.new
    segment.assign_attributes(predicates: segments)
    segment.execute_query.availables
  end

  alias subscribers available_segments

  def purge_metrics
    metrics.delete_all
  end

  def clone_record(record)
    self.new = record
  end

  def host
    Rails.application.routes.default_url_options[:host] || 'http://localhost:3000'
  end

  ## CHART STUFF
  def sparklines_by_day(opts = {})
    range = opts[:range] ||= 2.weeks.ago.midnight..Time.now
    metrics.group_by_day(:created_at, range: range).count.map { |o| o.to_a.last }
  end

  def add_stat_field(name:, label:, keys:)
    {
      name: name, label: label,
      keys: keys
    }
  end
end
