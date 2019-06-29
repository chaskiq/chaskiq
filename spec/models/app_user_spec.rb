require 'rails_helper'

RSpec.describe AppUser, type: :model do

  let(:app){ FactoryGirl.create :app}
  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  it "has events on created" do
    expect(app_user.events).to_not be_empty
    expect(app_user.events.first.action).to be == Event.action_for(:user_created)
  end

end