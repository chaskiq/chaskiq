class Campaign < ApplicationRecord
  belongs_to :app



  #  belongs_to :parent, class_name: "Chaskiq::Campaign", optional: true
  #  belongs_to :list
  #  has_many :subscribers, through: :list
  #  has_many :subscriptions, through: :subscribers
  #  has_many :attachments
  #  has_many :metrics
  #  belongs_to :template, class_name: "Chaskiq::Template", optional: true
    #accepts_nested_attributes_for :template, :campaign_template

    attr_accessor :step

    validates :subject, presence: true , unless: :step_1?
    validates :from_name, presence: true, unless: :step_1?
    validates :from_email, presence: true, unless: :step_1?

    #validates :plain_content, presence: true, unless: :template_step?
    validates :html_content, presence: true, if: :template_step?

    #before_save :detect_changed_template

    #mount_uploader :logo, CampaignLogoUploader

    def delivery_progress
      return 0 if metrics.deliveries.size.zero?
      subscriptions.availables.size.to_f / metrics.deliveries.size.to_f * 100.0
    end

    def subscriber_status_for(subscriber)
      #binding.pry
    end

    def step_1?
      self.step == 1
    end

    def template_step?
      self.step == "template"
    end

    def purge_metrics
      self.metrics.delete_all
    end

    def send_newsletter
      Chaskiq::MailSenderJob.perform_later(self)
    end

    def test_newsletter
      Chaskiq::CampaignMailer.test(self).deliver_later
    end

    def clone_newsletter
      cloned_record = self.deep_clone #(:include => :subscribers)
      cloned_record.name = self.name + "-copy"
      cloned_record
    end

    def detect_changed_template
      if self.changes.include?("template_id")
        copy_template
      end
    end

    #deliver email + create metric
    def push_notification(subscription)
      SesSenderJob.perform_later(self, subscription)
    end

    def prepare_mail_to(subscription)
      CampaignMailer.newsletter(self, subscription)
    end

    def copy_template
      self.html_content    = self.template.body
      self.html_serialized = self.template.body
      self.css = self.template.css
    end

    def campaign_url
      host = Rails.application.routes.default_url_options[:host]
      campaign_url = "#{host}/campaigns/#{self.id}"
    end

    def apply_premailer(opts={})
      host = Rails.application.routes.default_url_options[:host]
      skip_track_image = opts[:exclude_gif] ? "exclude_gif=true" : nil
      premailer_url = ["#{host}/manage/campaigns/#{self.id}/premailer_preview", skip_track_image].join("?")
      url = URI.parse(premailer_url)
      self.update_column(:premailer, clean_inline_css(url))
    end

    #will remove content blocks text
    def clean_inline_css(url)
      
      html = open(url).readlines.join("")
      #document = Roadie::Document.new html
      #document.transform

      premailer = Premailer.new(url, :adapter => :nokogiri, :escape_url_attributes => false)
      premailer.to_inline_css
    end

    def attributes_for_mailer(subscriber)

      subscriber_url = "#{campaign_url}/subscribers/#{subscriber.encoded_id}"
      track_image    = "#{campaign_url}/tracks/#{subscriber.encoded_id}/open.gif"

      { campaign_url: campaign_url,
        campaign_unsubscribe: "#{subscriber_url}/delete",
        campaign_subscribe: "#{campaign_url}/subscribers/new",
        campaign_description: "#{self.description}",
        track_image_url: track_image
      }
    end

    def mustache_template_for(subscriber)

      link_prefix = host + "/campaigns/#{self.id}/tracks/#{subscriber.encoded_id}/click?r="

      #html = Chaskiq::LinkRenamer.convert(premailer, link_prefix)
      subscriber_options = subscriber.attributes
                                      .merge(attributes_for_mailer(subscriber))
                                      .merge(subscriber.options)
                             
      compiled_premailer = premailer.gsub("%7B%7B", "{{").gsub("%7D%7D", "}}")                               
      compiled_mustache = Mustache.render(compiled_premailer, subscriber_options)

      html = Chaskiq::LinkRenamer.convert(compiled_mustache, link_prefix)
      html
    end

    def compiled_template_for(subscriber)
      html = mustache_template_for(subscriber)
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
