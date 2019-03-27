class UserAutoMessage < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true

  scope :in_time, ->{ where(['scheduled_at <= ? AND scheduled_to >= ?', Date.today, Date.today]) }

  def config_fields
    [
      #{name: "from_name", type: 'string'} ,
      #{name: "from_email", type: 'string'},
      #{name: "reply_email", type: 'string'},
      {name: "state", type: "select", options: ["enabled", "disabled" ]},
      {name: "name", type: 'string'} ,
      {name: "subject", type: 'text'} ,
      {name: "description", type: 'text'} ,
      #{name: "timezone", type: 'string'} ,
      #{name: "settings", type: 'string'} 
      {name: "scheduled_at", type: 'datetime'},
      {name: "scheduled_to", type: 'datetime'},
    ]
  end

  def self.availables_for(user)
    self.enabled.in_time.joins("left outer join metrics 
      on metrics.campaign_id = campaigns.id 
      AND metrics.action = 'viewed'
      AND metrics.trackable_type = 'AppUser' 
      AND metrics.trackable_id = #{user.id}"
      ).where("metrics.id is null")
  end

  # or closed or consumed 
  def available_for_user?(user_id)
    self.available_segments.find(user_id) && 
    self.metrics.where(action: 'viewed' , message_id: user_id ).empty?
  end

  def show_notification_for(user)
    if available_for_user?(user.id)
      
      self.metrics.create(
        trackable: user,
        action: "viewed",
        message_id: user.id
      )

      self
    end
  end

  def campaign_url
    host = Rails.application.routes.default_url_options[:host]
    campaign_url = "#{host}/campaigns/#{self.id}"
  end

  def attributes_for_template(subscriber)

    subscriber_url = "#{campaign_url}/subscribers/#{subscriber.encoded_id}"
    track_image    = "#{campaign_url}/tracks/#{subscriber.encoded_id}/open.gif"

    { email: subscriber.email,
      campaign_url: campaign_url,
      campaign_unsubscribe: "#{subscriber_url}/delete",
      campaign_subscribe: "#{campaign_url}/subscribers/new",
      campaign_description: "#{self.description}",
      track_image_url: track_image
    }
  end

  def mustache_template_for(subscriber)

    link_prefix = host + "/campaigns/#{self.id}/tracks/#{subscriber.encoded_id}/click?r="

    #html = LinkRenamer.convert(premailer, link_prefix)
    subscriber_options = subscriber.attributes
                                    .merge(attributes_for_template(subscriber))
                                    .merge(subscriber.properties)

    
    # could be the serialized content!
    compiled_premailer = self.html_content.to_s.gsub("%7B%7B", "{{").gsub("%7D%7D", "}}")                               
    Mustache.render(compiled_premailer, subscriber_options)

    #html = LinkRenamer.convert(compiled_mustache, link_prefix)
    #html
  end

end