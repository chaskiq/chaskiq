require 'rails_helper'

RSpec.describe Role, type: :model do
  
  #it{ should belong_to(:user) }
  #it{ should belong_to(:app) }

  let(:app){
    FactoryGirl.create :app
  }

  it "role" do
    user = User.create(
      email: Faker::Internet.email, 
      password: Devise.friendly_token[0,20] 
    )
  
    app.add_admin(user)
    expect(app.admin_users).to be_include(user)
  end


end
