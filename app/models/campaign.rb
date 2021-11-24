# frozen_string_literal: true

require "link_renamer"
require "open-uri"

class Campaign < Message
  validates :from_name, presence: true # , unless: :step_1?
  validates :from_email, presence: true # , unless: :step_1?
  validates :subject, presence: true # , unless: :step_1?

  def config_fields
    [
      { name: "name", label: I18n.t("definitions.campaigns.campaign_name.label"), hint: I18n.t("definitions.campaigns.campaign_name.hint"), type: "string", grid: { xs: "w-full", sm: "w-full" } },
      { name: "fromName", label: I18n.t("definitions.campaigns.from_name.label"), type: "string", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "subject", label: I18n.t("definitions.campaigns.email_subject.label"), hint: I18n.t("definitions.campaigns.email_subject.hint"), type: "text", grid: { xs: "w-full", sm: "w-full" } },
      # { name: 'fromEmail', label: I18n.t('definitions.campaigns.from_email.label'), type: 'string', grid: { xs: 'w-full', sm: 'w-1/2' } },
      # { name: "replyEmail", label: I18n.t("definitions.campaigns.reply_email.label"), type: "string", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "description", type: "textarea", grid: { xs: "w-full", sm: "w-full" } },
      { name: "timezone", type: "timezone",
        options: ActiveSupport::TimeZone.all.map { |o| o.tzinfo.name },
        multiple: false,
        grid: { xs: "w-full", sm: "w-full" } },
      # {name: "settings", type: 'string'} ,
      { name: "scheduledAt", label: I18n.t("definitions.campaigns.scheduled_at.label"), type: "datetime", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "scheduledTo", label: I18n.t("definitions.campaigns.scheduled_to.label"), type: "datetime", grid: { xs: "w-full", sm: "w-1/2" } }
    ]
  end

  def colors
    {
      delivery: "#9ae6b4",
      send: "#faf089",
      click: "#d6bcfa",
      open: "#90cdf4",
      bounces: "#ccc"
    }
  end

  def stats_fields
    [
      add_stat_field(
        name: "DeliverRateCount", label: "DeliverRateCount",
        keys: [{ name: "send", color: colors[:send] }, { name: "delivery", color: colors[:delivery] }]
      ),
      add_stat_field(
        name: "BouncesRateCount", label: "BouncesRateCount",
        keys: [{ name: "send", color: colors[:send] }, { name: "bounces", color: colors[:bounces] }]
      ),
      add_stat_field(
        name: "DeliverRateCount", label: "DeliverRateCount",
        keys: [{ name: "delivery", color: colors[:delivery] }, { name: "open", color: colors[:open] }]
      ),
      add_stat_field(
        name: "ClickRateCount", label: "ClickRateCount",
        keys: [{ name: "open", color: colors[:open] }, { name: "click", color: colors[:click] }]
      )
    ]
  end

  def delivery_progress
    return 0 if metrics.deliveries.size.zero?

    subscriptions.availables.size.to_f / metrics.deliveries.size.to_f * 100.0
  end

  def subscriber_status_for(subscriber); end

  def send_newsletter
    self.state = "delivering"
    save
    MailSenderJob.perform_later(self)
  end

  def test_newsletter
    CampaignMailer.test(self).deliver_later
  end

  def clone_newsletter
    cloned_record = deep_clone # (:include => :subscribers)
    cloned_record.name = name + "-copy"
    cloned_record
  end

  def detect_changed_template
    copy_template if changes.include?("template_id")
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

  def mustache_template_for(subscriber, html: nil)
    link_prefix = host + "/campaigns/#{id}/tracks/#{subscriber.encoded_id}/click?r="

    # html = LinkRenamer.convert(premailer, link_prefix)
    subscriber_options = subscriber.attributes
                                   .merge(attributes_for_template(subscriber))
                                   .merge(subscriber.properties)

    compiled_premailer = (html || premailer).gsub("%7B%7B", "{{").gsub("%7D%7D", "}}")
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
    skip_track_image = opts[:exclude_gif] ? "exclude_gif=true" : nil
    premailer_url = ["#{host}/apps/#{app.key}/premailer/#{id}", skip_track_image].join("?")
    url = URI.parse(premailer_url)
    update_column(:premailer, clean_inline_css(url))
  end

  # will remove content blocks text
  def clean_inline_css(url)
    html = open(url).readlines.join
    document = Roadie::Document.new html
    new_html = document.transform

    doc = Nokogiri::HTML(new_html)
    # rename active sotrage url to absolute for email readers
    doc.xpath("//img").each do |img|
      image_url = "#{Chaskiq::Config.get('HOST')}#{img['src']}"
      url = image_url.include?("rails/active_storage") ? image_url : img["src"]
      img["src"] = url
    end

    doc.to_html
  end

  def attributes_for_template(subscriber)
    subscriber_url = "#{campaign_url}/subscribers/#{subscriber.encoded_id}"
    track_image    = "#{campaign_api_url}/tracks/#{subscriber.encoded_id}/open.gif"

    {
      email: subscriber.email,
      campaign_url: campaign_url,
      campaign_unsubscribe: "#{subscriber_url}/delete",
      campaign_subscribe: "#{campaign_url}/subscribers/new",
      campaign_description: description.to_s,
      track_image_url: track_image
    }
  end

  def broadcast_event
    key = app.key
    EventsChannel.broadcast_to(key, {
      type: "campaigns",
      data: {
        campaign: id,
        state: "sent",
        ts: Time.now.to_i
      }
    }.as_json)
  end

  def hidden_constraints
    nil
  end

  def from_email
    campaign_outgoing_email
  end

  def self.decode_email(address)
    # "campaigns-#{app.key}-#{id}@#{app.outgoing_email_domain}"

    addr, domain = address.split("@")
    camp, encoded = addr.split("+")
    app_key, campaign_id = decoded_email(encoded).split("-")
    app = App.find_by(key: app_key)
    campaign = app.campaigns.find(campaign_id)
  rescue StandardError => e
    Rails.logger.error("error on decoding campaign email #{e}")
    nil
  end

  def self.encode_email(address)
    URLcrypt.encode(address)
  end

  def self.decoded_email(address)
    URLcrypt.decode(address)
  end

  def campaign_outgoing_email
    self[:from_email] ||
      (if app.outgoing_email_domain.present?
         part = "#{app.key}-#{id}"
         "campaigns+#{self.class.encode_email(part)}@#{app.outgoing_email_domain}"
       else
         ""
       end)
  end
end
