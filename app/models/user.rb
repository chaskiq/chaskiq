class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable

  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self


  has_many :app_users, dependent: :destroy
  has_many :roles, dependent: :destroy
  has_many :apps, through: :roles, source: :app

end
