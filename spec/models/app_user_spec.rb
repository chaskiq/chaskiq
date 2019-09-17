require 'rails_helper'

RSpec.describe AppUser, type: :model do

  include ActiveJob::TestHelper

  let(:app){ FactoryGirl.create :app}
  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  let(:visitor){ 
    app.add_anonymous_user({})
  }

  it "has events on created" do
    expect(app_user.events).to_not be_empty
    expect(app_user.events.first.action).to be == Event.action_for(:user_created)
  end

  describe "full contact enrichment" do
    it "send to enrichment" do
      App.any_instance.stub(:gather_social_data).and_return(true)
      visitor
      expect(app.app_users.count).to be == 1
      expect(DataEnrichmentJob).to receive(:perform_later)
      perform_enqueued_jobs do
        visitor.update(email: "miguelmichelson@gmail.com")
      end
    end

    it "not send on setting false" do
      App.any_instance.stub(:gather_social_data).and_return(false)
      visitor
      expect(app.app_users.count).to be == 1
      expect(DataEnrichmentJob).to_not receive(:perform_later)
      visitor.update(email: "miguelmichelson@gmail.com")
    end

  end

end