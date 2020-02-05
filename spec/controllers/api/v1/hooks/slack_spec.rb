require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do

  let(:slack_owner){
    { 
    }
  }

  let(:slack_user){
    {

    }
  }


  def block_actions(id: , sender: , recipient: , message_data: {} )

    payload = {
      "type"=>"block_actions",
      "team"=>{
        "id"=>"TQUC0ASKT", 
        "domain"=>"chaskiq"
      },
      "user"=>{
        "id"=>"UR2A93SRK", 
        "username"=>"miguelmichelson", 
        "name"=>"miguelmichelson", 
        "team_id"=>"TQUC0ASKT"
      },
      "api_app_id"=>"AR2A19HB2",
      "token"=>"xxx",
      "container"=> {
        "type"=>"message", 
        "message_ts"=>"1580837277.000700", 
        "channel_id"=>"CR2BJK89E", 
        "is_ephemeral"=>false
      },
      "trigger_id"=>"xxx",
      "channel"=>{
        "id"=>"CR2BJK89E", 
        "name"=>"chaskiq_channel"
      },
      "message"=> {
        "bot_id"=>"BQUCB00TT",
        "type"=>"message",
        "text"=>"New conversation from Chaskiq",
        "user"=>"UQUCB017B",
        "ts"=>"1580837277.000700",
        "team"=>"TQUC0ASKT",
        "blocks"=> []
      },
      "response_url"=>"https://hooks.slack.com/actions/TQUC0ASKT/938212856759/gV2SrIEhZogBMCSyMgg1lbTD",
      "actions"=> [
        {"action_id"=>"nNWo",
         "block_id"=>"sOZ",
         "text"=>{
           "type"=>"plain_text", 
           "text"=>"Reply in Channel", 
           "emoji"=>true
         },
         "value"=>"reply_in_channel_1234",
         "style"=>"primary",
         "type"=>"button",
         "action_ts"=>"1580837286.413915"
         }
      ]
      
    }

    {
      "payload"=> payload.to_json,
      "app_key"=> app.key, 
      "provider"=>"slack", 
      "id"=>id
    }


  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent_role) do
    app.add_agent(email: 'test2@test.cl')
  end

  let!(:app_package) do
    definitions = [
      {
        name: 'api_secret',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: 'api_key',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: 'access_token',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: 'access_token_secret',
        type: 'string',
        grid: { xs: 12, sm: 12 }
      }
    ]

    AppPackage.create(name: 'Slack', definitions: definitions)
  end


  describe "hooks" do

    before :each do

      AppPackageIntegration.any_instance
      .stub(:handle_registration)
      .and_return({})

      MessageApis::Slack.any_instance
      .stub(:direct_upload)
      .and_return("foobar")

      MessageApis::Slack.any_instance
      .stub(:create_channel)
      .and_return({
        "channel"=>{"id"=> "abc"}
      })

      MessageApis::Slack.any_instance
      .stub(:join_channel)
      .and_return({
        "channel"=>{"id"=> "abc"}
      })

      MessageApis::Slack.any_instance
      .stub(:update_reply_in_channel_message)
      .and_return(OpenStruct.new(body: ":)"))
  
      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        api_key: "aaa",
        access_token: "aaa",
        access_token_secret: "aaa",
        app_package: app_package,
      )

    end
  
    it "receive reply in channel" do
      allow_any_instance_of(MessageApis::Slack).to receive(:handle_reply_in_channel_action).once
      get(:process_event, params: block_actions(
        id: @pkg.id,
        sender: slack_user, 
        recipient: slack_owner)
      )
    end  

    it "receive reply in channel" do
      # SPEC ON CONVERSATION
      #allow_any_instance_of(MessageApis::Slack).to receive(:handle_reply_in_channel_action).once
      get(:process_event, params: block_actions(
        id: @pkg.id,
        sender: slack_user, 
        recipient: slack_owner)
      )
    end  
    
    
    it "receive two messages in single conversation" do
    end 
    
    it "reply from agent on twitter" do

    end


    it "receive text with breakline" do
    end


    it "receive text with video/gif" do
    end

    it "receive text with photo" do

    end

    #it "reply from agent locally" do
    #  pending #("this test belongs to graphql insert comment")
    #end

    it "send message" do


    end

  end

end