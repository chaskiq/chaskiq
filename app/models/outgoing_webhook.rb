class OutgoingWebhook < ApplicationRecord
  belongs_to :app

  validates :url , presence: true

  acts_as_taggable

  def send_verification

  end

  def send_notification(data: {})
    service = OutgoingWebhookService.new(url: self.url )
    response = service.send_post(data)
    response
  end

  def is_enabled
    state == "enabled"
  end

  def as_json(*)
    super.tap do |hash|
      hash['enabled'] = is_enabled
    end
  end

end
