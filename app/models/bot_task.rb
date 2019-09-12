class BotTask < ApplicationRecord
  belongs_to :app

  before_create :defaults

  store_accessor :settings, [ 
    :scheduling,
    :urls
  ]

  scope :enabled, -> { where(:state => 'enabled')}
  scope :disabled, -> { where(:state => 'disabled')}

  #scope :availables_for, ->(user){
  #  enabled.in_time.joins("left outer join metrics 
  #    on metrics.campaign_id = campaigns.id 
  #    AND settings->'hidden_constraints' ? metrics.action
  #    AND metrics.trackable_type = 'AppUser' 
  #    AND metrics.trackable_id = #{user.id}"
  #    ).where("metrics.id is null")
  #}

  def segments
    self.predicates
  end

  def segments=(data)
    self.predicates=(data)
  end

  def defaults
    self.predicates = [] unless self.predicates.present?
  end

  def available_segments
    segment = self.app.segments.new
    segment.assign_attributes(predicates: self.segments)
    app_users = segment.execute_query.availables
  end

  # or closed or consumed 
  def available_for_user?(user_id)
    begin
      self.available_segments.find(user_id) 
      # && 
      #self.metrics.where(action: self.hidden_constraints , message_id: user_id ).empty?
    rescue ActiveRecord::RecordNotFound
      false
    end
  end

end
