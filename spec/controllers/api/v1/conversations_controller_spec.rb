# frozen_string_literal: true

require 'rails_helper'

# RSpec.describe Api::V1::ConversationsController, type: :controller do
#
#   render_views
#
#     let!(:app){ FactoryBot.create :app }
#     let(:ref){"http://foo.bar/foo/baz"}
#     let(:data){
#        {  email: "miguel.michelson@gmail.com",
#           referrer: ref,
#           properties: {
#             user_id: 1,
#             name: "Miguel Michelson Martinez",
#             created_at: 1163470363,
#             lang: "es",
#             role: "super"
#           }
#         }
#     }
#
#     let(:user){
#       app.add_user({email: "test@test.cl", first_name: "dsdsa"})
#     }
#
#     it "saves conversation" do
#       request.headers.merge!({'HTTP_USER_DATA' => {email: user.email}.to_json })
#
#       post :create, params: {
#         app_id: app.key,
#         message: {serialized_content: "{}"},
#         format: :json
#       }
#
#       data = JSON.parse(response.body)
#       expect(response).to be_ok
#       expect(JSON.parse(response.body)).to an_instance_of(Hash)
#     end
#
#     it "get conversations" do
#       request.headers.merge!({'HTTP_USER_DATA' => {email: user.email }.to_json })
#
#       get :index, params: {
#         app_id: app.key,
#         format: :json
#       }
#       data = JSON.parse(response.body)
#       expect(response).to be_ok
#       expect(data).to an_instance_of(Hash)
#       expect(user.reload.last_visited_at).to_not be_blank
#     end
#
# end
