class Message < ApplicationRecord

  self.table_name = "campaigns"

  belongs_to :app

  has_many :metrics, foreign_key: "campaign_id"
  has_many_attached :attachments

  attr_accessor :step

  validates :subject, presence: true #, unless: :step_1?
  validates :from_name, presence: true #, unless: :step_1?
  validates :from_email, presence: true #, unless: :step_1?
  validates :html_content, presence: true, if: :template_step?

  #before_save :detect_changed_template
  before_create :add_default_predicate

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
