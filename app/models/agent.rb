require 'digest/md5'
 
class Agent < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  include Devise::JWT::RevocationStrategies::JTIMatcher
  include Redis::Objects
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self

  has_many :roles, dependent: :destroy
  has_many :apps, through: :roles, source: :app   
  has_many :assignment_rules
  has_many :articles, foreign_key: "author_id"

  has_many :conversations, foreign_key: "assignee_id"

  # from redis-objects
  counter :new_messages

  store_accessor :properties, [ 
    :name, 
    :first_name, 
    :last_name, 
    :country, 
    :country_code, 
    :region, 
    :region_code 
  ]

  def display_name
    [self.name].join(" ")
  end

  def avatar_url
    !self.bot? ? gravatar :
    ActionController::Base.helpers.asset_url("icons8-bot-50.png") 
  end

  def gravatar
    email_address = self.email.downcase
    hash = Digest::MD5.hexdigest(email_address)
    d = "https://api.adorable.io/avatars/130/#{hash}.png"
    image_src = "https://www.gravatar.com/avatar/#{hash}?d=#{d}"
  end

  def as_json(options = nil)
    super({ 
      only: [ :id, :kind, :display_name, :avatar_url] , 
      methods: [:id, :kind, :display_name, :avatar_url] }
      .merge(options || {})
    )
  end

  def kind
    self.class.model_name.singular
  end
end
