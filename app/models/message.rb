# frozen_string_literal: true

class Message < ApplicationRecord
  self.table_name = 'campaigns'

  belongs_to :app

  has_many :metrics, as: :trackable
  has_many_attached :attachments

  has_many :conversation_parts

  attr_accessor :step

  validates :name, presence: :true
  validates :subject, presence: true # , unless: :step_1?
  validates :html_content, presence: true, if: :template_step?

  scope :enabled, -> { where(state: 'enabled') }
  scope :disabled, -> { where(state: 'disabled') }
  # before_save :detect_changed_template
  before_create :add_default_predicate
  before_create :initial_state

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
    self.state = 'disabled'
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
    app_users = segment.execute_query.availables
  end

  alias subscribers available_segments

  def purge_metrics
    metrics.delete_all
  end

  def host
    Rails.application.routes.default_url_options[:host] || 'http://localhost:3000'
  end

  ## CHART STUFF
  def sparklines_by_day(opts = {})
    range = opts[:range] ||= 2.weeks.ago.midnight..Time.now
    metrics.group_by_day(:created_at, range: range).count.map { |o| o.to_a.last }
  end
end
