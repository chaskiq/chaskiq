class Message < ApplicationRecord

  self.table_name = "campaigns"

  belongs_to :app

  has_many :metrics, foreign_key: "campaign_id"
  has_many_attached :attachments

  attr_accessor :step

  validates :name, presence: :true
  validates :subject, presence: true #, unless: :step_1?
  validates :html_content, presence: true, if: :template_step?

  scope :enabled, -> { where(:state => 'enabled')}
  scope :disabled, -> { where(:state => 'disabled')}
  #before_save :detect_changed_template
  before_create :add_default_predicate
  before_create :initial_state

  def config_fields
    [
      {name: "from_name", type: 'string'} ,
      {name: "from_email", type: 'string'},
      {name: "reply_email", type: 'string'},
      {name: "description", type: 'text'} ,
      {name: "name", type: 'string'} ,
      {name: "timezone", type: 'string'} ,
      {name: "subject", type: 'text'} ,
      #{name: "settings", type: 'string'} 
      {name: "scheduled_at", type: 'datetime'},
      {name: "scheduled_to", type: 'datetime'}
    ]
  end

  def enabled?
    self.state == "active"
  end

  def disabled?
    self.state != "active"
  end

  def enable!
    self.update_attribute(:state, "enabled")
  end

  def disable!
    self.update_attribute(:state, "disabled")
  end

  def initial_state
    self.state = "disabled"
  end

  def add_default_predicate

    return if self.segments.present? && self.segments.any?
    
    self.segments = [] unless self.segments.present?

    self.segments << {
                        type: "match" ,
                        attribute: "match",
                        comparison: "and",
                        value: "and"
                      }
  end

  def step_1?
    self.step == 1
  end

  def template_step?
    self.step == "template"
  end

  def compiled_template_for(subscriber)
    html = mustache_template_for(subscriber)
  end

  def available_segments
    segment = self.app.segments.new
    segment.assign_attributes(predicates: self.segments)
    app_users = segment.execute_query.availables
  end

  alias subscribers available_segments

  def purge_metrics
    self.metrics.delete_all
  end

  def host
    Rails.application.routes.default_url_options[:host] || "http://localhost:3000"
  end

  ## CHART STUFF
  def sparklines_by_day(opts={})
    range = opts[:range] ||= 2.weeks.ago.midnight..Time.now
    self.metrics.group_by_day(:created_at, range: range ).count.map{|o| o.to_a.last}
  end



end
