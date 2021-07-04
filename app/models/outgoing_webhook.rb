class OutgoingWebhook < ApplicationRecord
  belongs_to :app

  validates :url, presence: true

  acts_as_taggable

  scope :enabled, lambda { where(state: 'enabled') }
  scope :disabled, lambda { where(state: 'disabled') }

  def send_verification; end

  def send_notification(data: {})
    service = OutgoingWebhookService.new(url: url)
    service.send_post(data)
  end

  def state=(val)
    self[:state] = case val
    when "1" then "enabled"
    when "0" then "disabled"
    else
      val
    end
  end

  def is_enabled
    state == "enabled"
  end

  def as_json(*)
    super.tap do |hash|
      hash["enabled"] = is_enabled
    end
  end
end
