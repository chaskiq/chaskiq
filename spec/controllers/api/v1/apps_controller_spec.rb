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

      request.headers.merge!({'HTTP_USER_DATA' => data.to_json })

      post :ping, params: { id: app.key }
      
      data = JSON.parse(response.body)

      expect(response).to be_ok
      expect(JSON.parse(response.body)).to an_instance_of(Hash)
      expect(AppUser.last.last_visited_at).to_not be_blank
    end

    context "encription" do

      it "renders the index template" do

        app.update_attributes(encryption_key: "unodostrescuatro")

        key = app.encryption_key

        encrypted_data = JWE.encrypt(data.to_json, key, alg: 'dir')

        request.headers.merge!({'HTTP_ENC_DATA' => encrypted_data })

        post :ping, params: { id: app.key }
        
        data = JSON.parse(response.body)
        expect(response).to be_ok
        expect(JSON.parse(response.body)).to an_instance_of(Hash)
        expect(AppUser.last.last_visited_at).to_not be_blank
      end


    end
end
