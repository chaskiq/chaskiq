# frozen_string_literal: true

require 'link_renamer'

class Tour < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true
  store_accessor :settings, %i[hidden_constraints url steps]
  before_save :fill_steps

  scope :in_time, -> { where(['scheduled_at <= ? AND scheduled_to >= ?', Date.today, Date.today]) }

  scope :availables_for, lambda { |user|
    enabled.in_time
    .joins("left outer join metrics
      on metrics.trackable_type = 'Message'
      AND metrics.trackable_id = campaigns.id
      AND metrics.app_user_id = #{user.id}
      AND settings->'hidden_constraints' ? metrics.action")
    .where('metrics.id is null')

    ## THIS WILL RETURN CAMPAINGS ON EMPTY METRICS FOR USER
    # enabled.in_time.joins("left outer join metrics
    #  on metrics.trackable_type = 'Message'
    #  AND metrics.trackable_id = campaigns.id
    #  AND metrics.app_user_id = #{user.id}"
    # ).where("metrics.id is null")
  }

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 12, sm: 10 } },
      { name: 'state', type: 'select',
        options: %w[enabled disabled],
        grid: { xs: 12, sm: 2 } 
      },
      { name: 'subject', type: 'string', grid: { xs: 12, sm: 8 } },
      { name: 'url', type: 'string', grid: { xs: 12, sm: 4 } },

      { name: 'description', type: 'text', grid: { xs: 12, sm: 12 } },

      { name: 'scheduledAt', type: 'datetime', grid: { xs: 12, sm: 6 } },
      { name: 'scheduledTo', type: 'datetime', grid: { xs: 12, sm: 6 } },

      { name: 'hiddenConstraints', type: 'select',
        options: [
          { label: 'open', value: 'open' },
          { label: 'close', value: 'close' },
          { label: 'finish', value: 'finish' },
          { label: 'skip', value: 'skip' }
        ],
        multiple: true,
        default: 'open',
        grid: { xs: 12, sm: 12 } }

    ]
  end

  def stats_fields
    [
      {
        name: 'DeliverRateCount', label: 'Deliver rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'skip', color: '#0747A6' }]
      },
      {
        name: 'ClickRateCount', label: 'Open/Finish rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'finish', color: '#0747A6' }]
      }
    ]
  end

  def track_url
    host + "/campaigns/#{id}/tracks/#{subscriber.encoded_id}"
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

  # or closed or consumed
  #def available_for_user?(user_id)
  #  available_segments.find(user_id) #&& metrics.where(action: hidden_constraints, message_id: user_id).empty?
  #rescue ActiveRecord::RecordNotFound
  #  false
  #end

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

  def campaign_url
    host = Rails.application.routes.default_url_options[:host]
    campaign_url = "#{host}/api/v1/apps/#{app.id}/messages/#{id}"
  end

  def attributes_for_template(subscriber)
    subscriber_url = "#{campaign_url}/subscribers/#{subscriber.encoded_id}"
    track_image    = "#{campaign_url}/tracks/#{subscriber.encoded_id}/open.gif"

    { email: subscriber.email,
      campaign_url: campaign_url,
      campaign_unsubscribe: "#{subscriber_url}/delete",
      campaign_subscribe: "#{campaign_url}/subscribers/new",
      campaign_description: description.to_s,
      track_image_url: track_image }
  end

  def mustache_template_for(subscriber)
    link_prefix = host + "/api/v1/apps/#{app.key}/messages/#{id}/tracks/#{subscriber.encoded_id}/click?r="

    # html = LinkRenamer.convert(premailer, link_prefix)
    subscriber_options = subscriber.attributes
                                   .merge(attributes_for_template(subscriber))
                                   .merge(subscriber.properties)

    # could be the serialized content!
    compiled_premailer = html_content.to_s.gsub('%7B%7B', '{{').gsub('%7D%7D', '}}')
    compiled_mustache = Mustache.render(compiled_premailer, subscriber_options)

    html = LinkRenamer.convert(compiled_mustache, link_prefix)
    html
  end

  def fill_steps
    self.steps = [] if steps.blank?
  end

  def self.broadcast_tour_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"

    tours = app.tours.availables_for(user)
    tour = tours.first

    return if tour.blank? || !tour.available_for_user?(user)

    if tours.any?
      MessengerEventsChannel.broadcast_to(key, {
        type: 'tours:receive',
        data: tour.as_json(only: [:id], methods: %i[steps url])
      }.as_json)
    end

    tours.any?
  end
end
