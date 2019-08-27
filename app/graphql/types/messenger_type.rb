module Types
  class MessengerType < Types::BaseObject
    field :app, Types::AppType, null: true
    
    field :app_user, Types::AppUserType, null: true

    def app_user
      binding.pry
    end
  end
end
