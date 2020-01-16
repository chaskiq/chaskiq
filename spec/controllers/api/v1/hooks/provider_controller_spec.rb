require 'rails_helper'

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do


  def crc_data(id)
    {
      "crc_token"=>"xxx", 
      "nonce"=>"xxxx", 
      "app_key"=>app.key, 
      "provider"=>"twitter", 
      "id"=>id
    }
  end

  def data(id)

    {"for_user_id"=>"7472512", 
      "direct_message_events"=>[
        {"type"=>"message_create", 
          "id"=>"1217536143559995396", 
          "created_timestamp"=>"1579118212009", 
          "message_create"=>{
            "target"=>{"recipient_id"=>"7472512"}, 
            "sender_id"=>"1140620289006551040", 
            "message_data"=>{
              "text"=>"oijoj", 
              "entities"=>{
                "hashtags"=>[], "symbols"=>[], "user_mentions"=>[], "urls"=>[]}
                }}}], 
                "users"=>{"1140620289006551040"=>{
                  "id"=>"1140620289006551040", 
                  "created_timestamp"=>"1560780043375", 
                  "name"=>"Chaskiq", 
                  "screen_name"=>"Chaskiqapp", 
                  "description"=>"chaskiq is an open source solution for conversational marketing , repo at https://t.co/Ewm6NlNbb4", "url"=>"https://t.co/GpWQHghDlj", 
                  "protected"=>false, "verified"=>false, 
                  "followers_count"=>10, 
                  "friends_count"=>83, 
                  "statuses_count"=>1, 
                  "profile_image_url"=>"http://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png", 
                  "profile_image_url_https"=>"https://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png"}, 
                  "7472512"=>{
                    "id"=>"7472512", 
                    "created_timestamp"=>"1184426915000", 
                    "name"=>"miguel michelson", 
                    "screen_name"=>"michelson", 
                    "location"=>"Chile", 
                    "description"=>"for (;;) {}", 
                    "url"=>"https://t.co/tiYdbaWQbN", 
                    "protected"=>false, 
                    "verified"=>false, 
                    "followers_count"=>508, 
                    "friends_count"=>763, 
                    "statuses_count"=>2077, 
                    "profile_image_url"=>"http://pbs.twimg.com/profile_images/803087380156661761/BGscrAur_normal.jpg", 
                    "profile_image_url_https"=>"https://pbs.twimg.com/profile_images/803087380156661761/BGscrAur_normal.jpg"}}, 
                  "app_key"=>app.key, 
                  "provider"=>"twitter", 
                  "id"=>id
                }
  end


  def data2(id)
    {"for_user_id"=>"7472512", 
      "direct_message_events"=>[
        {"type"=>"message_create", 
          "id"=>"1217897399189897220", 
          "created_timestamp"=>"1579204342063", 
          "message_create"=>{
            "target"=>{
              "recipient_id"=>"1140620289006551040"
            }, 
            "sender_id"=>"7472512", 
            "source_app_id"=>"3033300", 
            "message_data"=>{
              "text"=>"olalalalalalalala", 
              "entities"=>{
                "hashtags"=>[], 
                "symbols"=>[], 
                "user_mentions"=>[], 
                "urls"=>[]
              }
            }
          }
        }
      ], 
      "apps"=>{
        "3033300"=>{
          "id"=>"3033300", 
          "name"=>"Twitter Web App", 
          "url"=>"https://mobile.twitter.com"
        }
      }, 
      "users"=>{
        "7472512"=>{
          "id"=>"7472512", 
          "created_timestamp"=>"1184426915000", 
          "name"=>"miguel michelson", 
          "screen_name"=>"michelson", 
          "location"=>"Chile", 
          "description"=>"for (;;) {}", 
          "url"=>"https://t.co/tiYdbaWQbN", 
          "protected"=>false, 
          "verified"=>false, 
          "followers_count"=>508, 
          "friends_count"=>763, 
          "statuses_count"=>2077, 
          "profile_image_url"=>"http://pbs.twimg.com/profile_images/803087380156661761/BGscrAur_normal.jpg", 
          "profile_image_url_https"=>"https://pbs.twimg.com/profile_images/803087380156661761/BGscrAur_normal.jpg"
        }, 
      "1140620289006551040"=>{
        "id"=>"1140620289006551040", 
        "created_timestamp"=>"1560780043375", 
        "name"=>"Chaskiq", 
        "screen_name"=>"Chaskiqapp", 
        "description"=>"chaskiq is an open source solution for conversational marketing , repo at https://t.co/Ewm6NlNbb4", 
        "url"=>"https://t.co/GpWQHghDlj", 
        "protected"=>false, 
        "verified"=>false, 
        "followers_count"=>12, 
        "friends_count"=>87, 
        "statuses_count"=>1, 
        "profile_image_url"=>"http://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png", 
        "profile_image_url_https"=>"https://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png"}
      }, 
      "app_key"=>app.key, 
      "provider"=>"twitter", 
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

    AppPackage.create(name: 'Twitter', definitions: definitions)
  end


  describe "hooks" do

    before :each do

      AppPackageIntegration.any_instance
      .stub(:handle_registration)
      .and_return({})
  
      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        api_key: "aaa",
        access_token: "aaa",
        access_token_secret: "aaa",
        app_package: app_package,
        user_id: "michelson"
      )

    end

    it "receive challenge" do
      get(:create, params: crc_data(@pkg.id))
      expect(response.status).to be == 200
    end
  
    it "receive conversation data" do
      get(:process_event, params: data(@pkg.id))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
    end  
    
    
    it "receive two messages" do
      get(:process_event, params: data(@pkg.id))
      get(:process_event, params: data(@pkg.id))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end 
    
    it "reply from agent on twitter" do
      get(:process_event, params: data(@pkg.id))
      get(:process_event, params: data2(@pkg.id))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
      expect(app.conversations.first.messages.last.authorable).to be_a(Agent)
    end

    it "reply from agent locally" do
      get(:process_event, params: data(@pkg.id))
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
    end

  end

end