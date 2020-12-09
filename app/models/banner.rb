# frozen_string_literal: true

require 'link_renamer'

class Banner < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true
  # store_accessor :settings, %i[hidden_constraints url steps]
	# before_save :fill_steps
	
	store_accessor :settings, %i[
		hidden_constraints
    mode
		placement
		show_sender
		sender_id
		dismiss_button
		bg_color
		action_text
		url
		show_sender
  ]

  scope :in_time, -> { where(['scheduled_at <= ? AND scheduled_to >= ?', Date.today, Date.today]) }

  scope :availables_for, lambda { |user|
    enabled.in_time
           .joins("left outer join metrics
      on metrics.trackable_type = 'Message'
      AND metrics.trackable_id = campaigns.id
      AND metrics.app_user_id = #{user.id}
      AND settings->'hidden_constraints' ? metrics.action")
           .where('metrics.id is null')
	}
	
	def banner_data
		{
			mode: mode,
			placement: placement,
			show_sender: show_sender,
			sender_id: sender_id,
			dismiss_button: dismiss_button,
			bg_color: bg_color,
			action_text: action_text,
			url: url,
			show_sender: show_sender,
			sender_data: sender_data
		}
	end

	def sender_data
		a = sender_id ? app.agents.find(sender_id) : nil
		return nil unless a.present?
		{
			id: a.id,
			displayName: a.display_name,
			avatarUrl: a.avatar_url,
			email: a.email
		}
	end

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      #{ name: 'subject', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      #{ name: 'url', type: 'string', grid: { xs: 'w-full', sm: 'w-1/4' } },
      { name: 'description', type: 'text', grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'scheduledTo', label: 'Scheduled to', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'hiddenConstraints', label: 'Hidden constraints', type: 'select',
        options: [
          { label: 'open', value: 'open' },
          { label: 'close', value: 'close' },
          { label: 'click', value: 'click' }
        ],
        multiple: true,
        default: 'open',
        grid: { xs: 'w-full', sm: 'w-full' } }

    ]
  end

  def stats_fields
    [
      {
        name: 'CloseRateCount', label: 'Open/Close rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'close', color: '#0747A6' }]
      },
      {
        name: 'ClickRateCount', label: 'Open/Click rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'click', color: '#0747A6' }]
			},
			{
        name: 'ClickCloseRateCount', label: 'Click/Close rate',
        keys: [{ name: 'close', color: '#F4F5F7' },
               { name: 'click', color: '#0747A6' }]
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
    comparator.compare # && metrics.where(app_user_id: user.id).blank?
  rescue ActiveRecord::RecordNotFound
    false
  end

  # or closed or consumed
  # def available_for_user?(user_id)
  #  available_segments.find(user_id) #&& metrics.where(action: hidden_constraints, message_id: user_id).empty?
  # rescue ActiveRecord::RecordNotFound
  #  false
  # end

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

    LinkRenamer.convert(compiled_mustache, link_prefix)
  end

  def self.broadcast_banner_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"


		banners = app.banners.availables_for(user)
    banner = banners.first
		
    return if banner.blank? || !banner.available_for_user?(user)

    if banners.any?
      MessengerEventsChannel.broadcast_to(key, {
        type: 'banners:receive',
        data: banner.as_json(only: [:id], methods: %i[banner_data serialized_content html_content])
			}.as_json)

			true
    end
  end
end
