# frozen_string_literal: true

require 'link_renamer'

class UserAutoMessage < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true
  store_accessor :settings, [:hidden_constraints]

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'subject', type: 'text', grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'description', type: 'text', grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'hiddenConstraints', type: 'select',
        options: [
          { label: 'open', value: 'open' },
          { label: 'close', value: 'close' },
          { label: 'click', value: 'click' }
        ],
        multiple: true,
        default: 'open',
        grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'scheduledTo', label: 'Scheduled to', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } }
    ]
  end

  def stats_fields
    [
      {
        name: 'DeliverRateCount', label: 'DeliverRateCount',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'click', color: '#0747A6' }]
      },
      {
        name: 'OpenRateCount', label: 'OpenRateCount',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'close', color: '#0747A6' }]
      }
    ]
  end

  def track_url
    host + "/campaigns/#{id}/tracks/#{subscriber.encoded_id}"
  end

  def campaign_url
    host = Rails.application.routes.default_url_options[:host]
    campaign_url = "#{host}/api/v1/apps/#{app.id}/messages/#{id}"
  end

  def attributes_for_template(subscriber)
    { email: subscriber.email,
      campaign_url: campaign_url,
      campaign_description: description.to_s
    }
  end

  def mustache_template_for(subscriber)
    link_prefix = host + "/api/v1/apps/#{app.key}/messages/#{id}/tracks/#{subscriber.encoded_id}/click?r="

    subscriber_options = subscriber.attributes
                                   .merge(attributes_for_template(subscriber))
                                   .merge(subscriber.properties)

    # could be the serialized content!
    compiled_premailer = html_content.to_s.gsub('%7B%7B', '{{').gsub('%7D%7D', '}}')
    compiled_mustache = Mustache.render(compiled_premailer, subscriber_options)

    LinkRenamer.convert(compiled_mustache, link_prefix)
  end

  def self.broadcast_message_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"

    messages = app.user_auto_messages.availables_for(user)
    return if messages.blank?

    if messages.any?
      MessengerEventsChannel.broadcast_to(key,
                                          type: 'messages:receive',
                                          data: messages.as_json(only: %i[id
                                                                          created_at
                                                                          updated_at
                                                                          serialized_content
                                                                          theme]))
    end

    messages.any?
  end

end
