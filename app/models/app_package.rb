# frozen_string_literal: true

class AppPackage < ApplicationRecord
  has_many :app_package_integrations, dependent: :destroy
  has_many :apps, through: :app_package_integrations
  belongs_to :author, class_name: "Agent", optional: true, foreign_key: :agent_id

  acts_as_taggable_on :tags, :capabilities

  store :settings, accessors: %i[
    definitions
    icon
    editor_definitions
    credentials
    api_url
    initialize_url
    configure_url
    submit_url
    sheet_url
    oauth_url
    content_url
  ], coder: JSON

  validates :name, presence: true, uniqueness: true
  validates :api_url, url: true, if: -> { is_external? }
  validates :initialize_url, url: true, if: -> { is_external? }
  validates :configure_url, url: true, if: -> { is_external? }
  validates :content_url, url: true, if: -> { is_external? }
  validates :submit_url, url: true, if: -> { submit_url.present? }
  validates :sheet_url, url: true, if: -> { sheet_url.present? }
  validates :oauth_url, url: true, if: -> { oauth_url.present? }

  # validate :api_url_challenge, if: :is_external?

  before_save :set_default_definitions

  def is_external?
    return true if author.present?

    # will return true for non existing message_apply
    external = begin
      message_api_klass
    rescue StandardError => e
      Rails.logger.debug e.message
      nil
    end
    external.nil?
  end

  def api_url_challenge
    token = SecureRandom.urlsafe_base64(nil, false)

    data = {
      challenge: token
    }

    begin
      resp = Faraday.post(
        url,
        data.to_json,
        "Content-Type" => "application/json"
      )
    rescue StandardError
      errors.add(:api_url, "action format error")
      return
    end

    errors.add(:api_url, "action format error") unless resp.body == token
  end

  def validate_external_api_domain
    # 1) same host??? url are the same host??
    # host = URI.parse(api_url).host
    # host_for(initialize_url) == host if initialize_url.present?
    # host_for(configure_url) == host if configure_url.present?
    # host_for(submit_url) == host if submit_url.present?
    # host_for(sheet_url) == host if sheet_url.present?
    # host_for(oauth_url) == host if oauth_url.present?
  end

  def host_for(url)
    URI.parse(url).host
  end

  # for authorizations
  delegate :process_global_hook, to: :message_api_klass

  def set_default_definitions
    return if definitions.present?

    external_token_definition = [
      {
        name: "access_token",

        type: "string",
        grid: { xs: "w-full", sm: "w-full" }
      }
    ]

    return self.definitions = external_token_definition if is_external?

    self.definitions = []
  end

  # message api
  def message_api_klass
    @message_api_klass ||= "MessageApis::#{name}::Api".constantize
  end
end
