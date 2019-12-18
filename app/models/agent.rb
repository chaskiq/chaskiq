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
    # get the email from URL-parameters or what have you and make lowercase
    email_address = self.email.downcase
    # create the md5 hash
    hash = Digest::MD5.hexdigest(email_address)

    d = "https://api.adorable.io/avatars/130/#{hash}.png"
    # compile URL which can be used in <img src="RIGHT_HERE"...
    image_src = "https://www.gravatar.com/avatar/#{hash}?d=#{d}"
  end


  def as_json(options = nil)
    super({ 
      only: [:email, :id, :kind, :display_name] , 
      methods: [:email, :id, :kind, :display_name] }
      .merge(options || {})
    )
  end

  def kind
    self.class.model_name.singular
  end
end
