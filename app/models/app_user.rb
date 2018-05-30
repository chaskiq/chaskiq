class AppUser < ApplicationRecord
  belongs_to :user
  belongs_to :app
  store :properties, accessors: [ :name, :first_name, :last_name ], coder: JSON

  include AASM

  aasm column: :state do
    state :offline, :initial => true
    state :online

    event :offline do
      transitions :from => :online, :to => :offline
    end

    event :online do
      transitions :from => :offline, :to => :online
    end
  end

end
