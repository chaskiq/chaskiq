# frozen_string_literal: true

require "digest/md5"

class Agent < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  include Redis::Objects

  include AuditableBehavior

  devise  :invitable,
          :database_authenticatable,
          :registerable, # disabled registrations
          :recoverable,
          :rememberable,
          :validatable,
          :lockable,
          :omniauthable, omniauth_providers: %i[doorkeeper auth0]

  include OmniauthExtension

  has_many :app_packages, dependent: :nullify
  has_many :access_grants,
           class_name: "Doorkeeper::AccessGrant",
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  has_many :access_tokens,
           class_name: "Doorkeeper::AccessToken",
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  has_many :auth_identities, dependent: :delete_all

  has_many :roles, dependent: :destroy, class_name: "Role"
  has_many :agent_teams, through: :roles, class_name: "AgentTeam"
  has_many :teams, through: :agent_teams

  has_many :apps, through: :roles, source: :app
  has_many :owned_apps, class_name: "App",
                        foreign_key: "owner_id",
                        dependent: :nullify
  has_many :assignment_rules, dependent: :nullify
  has_many :articles, foreign_key: "author_id", dependent: :nullify
  has_many :conversations, foreign_key: "assignee_id", dependent: :nullify

  scope :bots, -> { where(bot: true) }
  scope :humans, -> { where(bot: nil).or(where(bot: false)) }

  # from redis-objects
  counter :new_messages

  store_accessor :properties, %i[
    name
    first_name
    last_name
    country
    country_code
    region
    region_code
    enable_deliveries
    lang
    permissions
    area_of_expertise
    specialization
    phone_number
    address
    availability
  ]

  has_one_attached :avatar

  attr_accessor :roles_for_current_app, :roles_for_current_app_ids

  def self.ransackable_attributes(auth_object = nil)
    %w[available bot confirmation_sent_at confirmation_token confirmed_at created_at current_sign_in_at current_sign_in_ip email encrypted_password failed_attempts id id_value invitation_accepted_at invitation_created_at invitation_limit invitation_sent_at invitation_token invitations_count invited_by_id invited_by_type key last_sign_in_at last_sign_in_ip locked_at properties remember_created_at reset_password_sent_at reset_password_token sign_in_count unconfirmed_email unlock_token updated_at]
  end

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.name = auth.info.name
    end
  end

  def update_doorkeeper_credentials(auth)
    update(
      doorkeeper_access_token: auth.credentials.token,
      doorkeeper_refresh_token: auth.credentials.refresh_token
    )
  end

  def can_create_apps?
    Chaskiq::Config.fetch("DISABLE_APP_CREATION", "false") != "true"
  end

  def display_name
    [name].join(" ")
  end

  def avatar_url
    return default_avatar unless avatar.attached?

    url = get_remote_avatar_url
    return nil if url.blank?

    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        url
      )
    rescue StandardError
      nil
    end
  end

  def gravatar
    email_address = email.downcase
    hash = Digest::MD5.hexdigest(email_address)
    d = "https://ui-avatars.com/api/#{URI.encode_www_form_component(display_name)}/128"
    image_src = "https://www.gravatar.com/avatar/#{hash}?d=#{d}"
  end

  def as_json(options = nil)
    super({
      only: %i[id kind display_name avatar_url],
      methods: %i[id kind display_name avatar_url]
    }
      .merge(options || {})
    )
  end

  def kind
    self.class.model_name.singular
  end

  def self.editable_attributes
    %i[
      avatar
      name
      first_name
      last_name
      country
      country_code
      region
      region_code
      enable_deliveries
      lang
      permissions
      area_of_expertise
      specialization
      phone_number
      address
      availability
      available
    ]
  end

  private

  def default_bot_avatar
    ActionController::Base.helpers.image_url("icons8-bot-50.png")
  rescue StandardError
    nil
  end

  def default_avatar
    bot? ? default_bot_avatar : gravatar
  end

  def get_remote_avatar_url
    url = begin
      avatar.variant(resize_to_limit: [100, 100]).processed
    rescue StandardError
      nil
    end
  end
end
