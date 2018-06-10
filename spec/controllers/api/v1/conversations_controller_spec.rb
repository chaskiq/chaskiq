require 'rails_helper'

RSpec.describe Api::V1::ConversationsController, type: :controller do

  render_views

    let!(:app){ FactoryGirl.create :app }
    let(:ref){"http://foo.bar/foo/baz"}
    let(:data){
       {  email: "miguel.michelson@gmail.com",
          referrer: ref,
          properties: {
            user_id: 1,
            name: "Miguel Michelson Martinez",
            created_at: 1163470363,
            lang: "es",
            role: "super"
          }
        }
    }

    let(:user){
      app.add_user({email: "test@test.cl", first_name: "dsdsa"})
    }

    it "saves convo" do
      post :show, params: {
        app_id: app.key,
        email: data
      }
      
      data = JSON.parse(response.body)
      expect(response).to be_ok
      expect(JSON.parse(response.body)).to an_instance_of(Hash)
      expect(AppUser.last.last_visited_at).to_not be_blank
    end

    it "get conversations" do
      get :index, params: {
        app_id: app.key,
        email: "test@test.cl",
        format: :json
      }
      data = JSON.parse(response.body)
      expect(response).to be_ok
      expect(data).to an_instance_of(Hash)
      expect(user.reload.last_visited_at).to_not be_blank
    end

end
