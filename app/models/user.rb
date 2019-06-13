class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable

  include DeviseTokenAuth::Concerns::ActiveRecordSupport
  include DeviseTokenAuth::Concerns::User
    
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :app_users
  has_many :roles
  has_many :apps, through: :roles, source: :app

end
