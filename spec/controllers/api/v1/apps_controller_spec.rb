require 'rails_helper'

RSpec.describe Api::V1::AppsController, type: :controller do

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

    it "renders the index template" do
      post :ping, params: {
        id: app.key,
        user_data: data
      }
      
      data = JSON.parse(response.body)
      expect(response).to be_ok
      expect(JSON.parse(response.body)).to an_instance_of(Hash)
      expect(AppUser.last.last_visited_at).to_not be_blank
    end

end
