require "link_renamer"

class UserAutoMessage < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true

  scope :in_time, ->{ where(['scheduled_at <= ? AND scheduled_to >= ?', Date.today, Date.today]) }
  
  scope :availables_for, ->(user){
    enabled.in_time.joins("left outer join metrics 
      on metrics.campaign_id = campaigns.id 
      AND settings->'hidden_constraints' ? metrics.action
      AND metrics.trackable_type = 'AppUser' 
      AND metrics.trackable_id = #{user.id}"
      ).where("metrics.id is null")
  }

  store_accessor :settings, [:hidden_constraints]


  def config_fields
    [
      {name: "state", type: "select", options: ["enabled", "disabled" ]},
      {name: "name", type: 'string'} ,
      {name: "subject", type: 'text'} ,
      {name: "description", type: 'text'},
      {name: "hidden_constraints", type: "select", 
        options: ["closed", "click", "viewed" ], 
        multiple: true,
        default: "click"
      },
      {name: "scheduled_at", type: 'datetime'},
      {name: "scheduled_to", type: 'datetime'},
    ]
  end


  def stats_fields
    [
      {name: "DeliverRateCount", label: "DeliverRateCount", 
        keys: [{name: "viewed", color: "#F4F5F7"}, 
              {name: "click", color: "#0747A6"}] 
        },
      {name: "ClickRateCount", label: "ClickRateCount", 
        keys: [{name: "viewed" , color: "#F4F5F7"}, 
                {name: "close", color: "#0747A6"}] 
      },
    ]
  end

  # or closed or consumed 
  def available_for_user?(user_id)
    self.available_segments.find(user_id) && 
    self.metrics.where(action: self.hidden_constraints , message_id: user_id ).empty?
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
    campaign_url = "#{host}/api/v1/apps/#{self.app.id}/messages/#{self.id}"
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

    link_prefix = host + "/api/v1/apps/#{self.app.key}/messages/#{self.id}/tracks/#{subscriber.encoded_id}/click?r="

    #html = LinkRenamer.convert(premailer, link_prefix)
    subscriber_options = subscriber.attributes
                                    .merge(attributes_for_template(subscriber))
                                    .merge(subscriber.properties)

    
    # could be the serialized content!
    compiled_premailer = self.html_content.to_s.gsub("%7B%7B", "{{").gsub("%7D%7D", "}}")                               
    compiled_mustache = Mustache.render(compiled_premailer, subscriber_options)

    html = LinkRenamer.convert(compiled_mustache, link_prefix)
    html
  end

end