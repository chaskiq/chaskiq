# frozen_string_literal: true

require 'link_renamer'
require 'open-uri'

class Campaign < Message
  validates :from_name, presence: true # , unless: :step_1?
  validates :from_email, presence: true # , unless: :step_1?

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 12, sm: 12 } },
      { name: 'subject', type: 'text', grid: { xs: 12, sm: 12 } },
      { name: 'fromName', type: 'string', grid: { xs: 12, sm: 6 } },
      { name: 'fromEmail', type: 'string', grid: { xs: 12, sm: 6 } },
      { name: 'replyEmail', type: 'string', grid: { xs: 12, sm: 6 } },
      { name: 'description', type: 'text', grid: { xs: 12, sm: 12 } },
      { name: 'timezone', type: 'timezone',
        options: ActiveSupport::TimeZone.all.map { |o| o.tzinfo.name },
        multiple: false,
        grid: { xs: 12, sm: 12 } },
      # {name: "settings", type: 'string'} ,
      { name: 'scheduledAt', type: 'datetime', grid: { xs: 12, sm: 6 } },
      { name: 'scheduledTo', type: 'datetime', grid: { xs: 12, sm: 6 } }
    ]
  end

  def stats_fields
    [
      { name: 'DeliverRateCount', label: 'DeliverRateCount', keys: [{ name: 'send', color: '#444' }, { name: 'open', color: '#ccc' }] },
      { name: 'ClickRateCount', label: 'ClickRateCount', keys: [{ name: 'send', color: '#444' }, { name: 'click', color: '#ccc' }] },
      { name: 'BouncesRateCount', label: 'BouncesRateCount', keys: [{ name: 'send', color: '#444' }, { name: 'bounces', color: '#ccc' }] },
      { name: 'ComplaintsRate', label: 'ComplaintsRate', keys: [{ name: 'send', color: '#444' }, { name: 'complaints', color: '#ccc' }] }
    ]
  end

  def delivery_progress
    return 0 if metrics.deliveries.size.zero?

    subscriptions.availables.size.to_f / metrics.deliveries.size.to_f * 100.0
  end

  def subscriber_status_for(subscriber)
    # binding.pry
  end

  def send_newsletter
    self.state = 'delivering'
    save
    MailSenderJob.perform_later(self)
  end

  def test_newsletter
    CampaignMailer.test(self).deliver_later
  end

  def clone_newsletter
    cloned_record = deep_clone # (:include => :subscribers)
    cloned_record.name = name + '-copy'
    cloned_record
  end

  def detect_changed_template
    copy_template if changes.include?('template_id')
  end

  # deliver email + create metric
  def push_notification(subscription)
    SesSenderJob.perform_later(self, subscription)
  end

  def prepare_mail_to(subscription)
    CampaignMailer.newsletter(self, subscription)
  end

  def copy_template
    self.html_content    = template.body
    self.html_serialized = template.body
    self.css = template.css
  end

  def mustache_template_for(subscriber)
    link_prefix = host + "/campaigns/#{id}/tracks/#{subscriber.encoded_id}/click?r="

    # html = LinkRenamer.convert(premailer, link_prefix)
    subscriber_options = subscriber.attributes
                                   .merge(attributes_for_template(subscriber))
                                   .merge(subscriber.properties)

    compiled_premailer = premailer.gsub('%7B%7B', '{{').gsub('%7D%7D', '}}')
    Mustache.render(compiled_premailer, subscriber_options)

    # html = LinkRenamer.convert(compiled_mustache, link_prefix)
    # html
  end

  def campaign_url
    host = Rails.application.routes.default_url_options[:host]
    campaign_url = "#{host}/campaigns/#{id}"
  end

  def campaign_api_url
    host = Rails.application.routes.default_url_options[:host]
    campaign_url = "#{host}/api/v1/apps/#{app.key}/messages/#{id}"
  end

  def apply_premailer(opts = {})
    host = Rails.application.routes.default_url_options[:host]
    skip_track_image = opts[:exclude_gif] ? 'exclude_gif=true' : nil
    premailer_url = ["#{host}/apps/#{app.key}/premailer/#{id}", skip_track_image].join('?')
    url = URI.parse(premailer_url)
    update_column(:premailer, clean_inline_css(url))
  end

  # will remove content blocks text
  def clean_inline_css(url)
    html = open(url).readlines.join('')
    document = Roadie::Document.new html
    document.transform
    # premailer = Premailer.new(url, :adapter => :nokogiri, :escape_url_attributes => false)
    # premailer.to_inline_css
  end

  def attributes_for_template(subscriber)
    subscriber_url = "#{campaign_url}/subscribers/#{subscriber.encoded_id}"
    track_image    = "#{campaign_api_url}/tracks/#{subscriber.encoded_id}/open.gif"

    { email: subscriber.email,
      campaign_url: campaign_url,
      campaign_unsubscribe: "#{subscriber_url}/delete",
      campaign_subscribe: "#{campaign_url}/subscribers/new",
      campaign_description: description.to_s,
      track_image_url: track_image }
  end

  def hidden_constraints
    nil
  end
end
