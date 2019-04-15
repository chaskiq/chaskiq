class App < ApplicationRecord
  include Tokenable

  store :preferences, accessors: [ :notifications, :gather_data, :test_app ], coder: JSON

  # http://nandovieira.com/using-postgresql-and-jsonb-with-ruby-on-rails
  # App.where('preferences @> ?', {notifications: true}.to_json)

  has_many :app_users
  has_many :users, through: :app_users
  has_many :conversations
  has_many :segments
  has_many :roles
  has_many :admin_users, through: :roles, source: :user
  has_many :campaigns

  has_many :user_auto_messages

  has_many :messages

  store_accessor :preferences, [:active_messenger, :domain_url]

  def encryption_enabled?
    self.encryption_key.present?
  end

  def config_fields
    [
      {name: "name", type: 'string'} ,
      {name: "domain_url", type: 'string'} ,
      {name: "state", type: "select", options: ["enabled", "disabled" ]},
      {name: "active_messenger", type: 'bool'},
      {name: "encryption_key", type: 'string', maxLength: 16, minLength: 16, placeholder: "leave it blank for no encryption"} 
    ]
  end

  def add_user(attrs)
    email = attrs.delete(:email)
    user = User.find_or_initialize_by(email: email)
    #user.skip_confirmation!
    if user.new_record?
      user.password = Devise.friendly_token[0,20]
    end
    user.save!
    ap = app_users.find_or_initialize_by(user_id: user.id)
    data = attrs.deep_merge!(properties: ap.properties)
    ap.assign_attributes(data)
    ap.last_visited_at = Time.now
    ap.save
    ap
  end

  def add_admin(user)
    user.roles.create(app: self, role: "admin")
    self.add_user(email: user.email)
  end

  def add_visit(opts={})
    add_user(opts)
  end

  def start_conversation(options)
    message = options[:message]
    user = options[:from]
    conversation = self.conversations.create(main_participant: user)
    conversation.add_message(
      from: user,
      message: message
    )
    conversation
  end
end