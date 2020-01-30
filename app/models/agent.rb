# frozen_string_literal: true

require 'digest/md5'

class Agent < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  include Redis::Objects

  devise  :invitable,
          :database_authenticatable,
          :registerable,
          :recoverable,
          :rememberable,
          :validatable,
          :omniauthable, omniauth_providers: %i[doorkeeper]

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


  has_many :access_grants,
         class_name: 'Doorkeeper::AccessGrant',
         foreign_key: :resource_owner_id,
         dependent: :delete_all # or :destroy if you need callbacks

  has_many :access_tokens,
      class_name: 'Doorkeeper::AccessToken',
      foreign_key: :resource_owner_id,
      dependent: :delete_all # or :destroy if you need callbacks

  has_many :roles, dependent: :destroy
  has_many :apps, through: :roles, source: :app
  has_many :assignment_rules
  has_many :articles, foreign_key: 'author_id'

  has_many :conversations, foreign_key: 'assignee_id'

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
  ]

  has_one_attached :avatar

  def display_name
    [name].join(' ')
  end

  def default_avatar
    ActionController::Base.helpers.asset_url('icons8-bot-50.png')
  end

  def avatar_url
    return !bot? ? 
        gravatar :
        default_avatar unless avatar.attached?

    #return '' unless object.avatar_blob.present?

    url = begin
            avatar.variant(resize_to_limit: [100, 100]).processed
          rescue StandardError
            nil
          end
    return nil if url.blank?

    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        url,
        #only_path: true
      )
    rescue StandardError
      nil
    end
  end

  def gravatar
    email_address = email.downcase
    hash = Digest::MD5.hexdigest(email_address)
    d = "https://api.adorable.io/avatars/130/#{hash}.png"
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
end
