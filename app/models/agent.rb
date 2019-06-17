class Agent < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :roles, dependent: :destroy
  has_many :apps, through: :roles, source: :app   


  store_accessor :properties, [ 
    :name, 
    :first_name, 
    :last_name, 
    :country, 
    :country_code, 
    :region, 
    :region_code 
  ]

end
