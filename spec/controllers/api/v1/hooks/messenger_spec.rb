require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do

  let(:owner){
    '111'
  }

  let(:messenger_user){
    '222'
  }

  def data_for(id: , sender: , recipient: , message_data: {} )

    {
      "object"=>"page",
      "entry"=> [
        {
          "id"=> messenger_user,
          "time"=>1584306131665,
          "messaging"=>
            [
              {
                "sender"=>{"id"=> sender},
                "recipient"=>{"id"=> recipient},
                "timestamp"=>1584306131473,
                "message"=>message_data 
              }
            ]
            }
          ],
      "controller"=>"api/v1/hooks/provider",
      "action"=>"process_event",
      #"provider"=>"messenger", 
      #"app_key"=>app.key, 
      "id"=>@pkg.encoded_id
    }


  end

  def data_for_media(id: , sender: , recipient:, message_data: {} )
    {"object"=>"page",
      "entry"=>
      [{"id"=> messenger_user,
         "time"=>1584319515773,
         "messaging"=>
          [{"sender"=>{"id"=>sender},
            "recipient"=>{"id"=> recipient},
            "timestamp"=>1584319515594,
            "message"=>
             {"mid"=>"m_SI8mIb5AznFXdNPD41lPdC8S8D0J3Za7tGejm-0UcxpXQ2wewM_m-nLHh0_JczziFl2DCV5ALk0dLjWEL8Hcpg",
              "attachments"=>
               [{"type"=>"image",
                 "payload"=>
                  {"url"=>
                    "https://scontent.xx.fbcdn.net/v/t1.15752-9/89914047_3064283150302931_8803003611702362112_n.jpg?_nc_cat=106&_nc_sid=b96e70&_nc_ohc=Jbe28l9g220AX87n6X2&_nc_ad=z-m&_nc_cid=0&_nc_zor=9&_nc_ht=scontent.xx&oh=9b37a4ae4764b84999fa426426b79a1f&oe=5E943DF1"
                    }
                  },
                {"type"=>"image",
                 "payload"=>
                  {"url"=>
                    "https://scontent.xx.fbcdn.net/v/t1.15752-9/89932582_3336984223001587_8084394951028244480_n.jpg?_nc_cat=101&_nc_sid=b96e70&_nc_ohc=u7dQz-ykcuUAX9TUsw6&_nc_ad=z-m&_nc_cid=0&_nc_zor=9&_nc_ht=scontent.xx&oh=795f9fe18dd8b9c9aa158bc5865bfd0d&oe=5E93E844"
                  }
                },
                {"type"=>"image",
                 "payload"=>
                  {"url"=>
                    "https://scontent.xx.fbcdn.net/v/t1.15752-9/89964471_2707657919513302_5539075521851162624_n.jpg?_nc_cat=109&_nc_sid=b96e70&_nc_ohc=JV_H8iOR-nEAX-VbDWb&_nc_ad=z-m&_nc_cid=0&_nc_zor=9&_nc_ht=scontent.xx&oh=510744c198db2a6f32c346bf6303c6e1&oe=5E9422E3"
                    }
                  }
                ]
              }
            }
          ]
        }
      ],
      "controller"=>"api/v1/hooks/provider",
      "action"=>"process_event",
      #"app_key"=> @pkg.app.key,
      #"provider"=>"messenger",
      "id"=> id
    }


  end


  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({email: 'test2@test.cl'})
  end

  let(:app_package) do
    AppPackage.find_by(name: 'Messenger')
  end

  let(:profile_data) do
    {
      "first_name"=>"Mike",
      "last_name"=>"Mich",
      "profile_pic"=>"aaa",
      "id"=>messenger_user
    }
  end

  #   when send message from chaskiq , stub ths
  #  {\"recipient_id\":\"222\",\"message_id\":\"aaaaa\"}

  describe "hooks" do
    before do
      AppPackagesCatalog.update_all
    end
    before :each do

      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      AppPackageIntegration.any_instance
      .stub(:handle_registration)
      .and_return({})
  

      MessageApis::Messenger.any_instance
      .stub(:get_fb_profile)
      .and_return(profile_data)

      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        api_key: "aaa",
        user_id: owner,
        verify_token: '1234',
        app_package: app_package
      )

    end

    it "receive activation hook" do
      params = {
        "hub.mode"=>"subscribe", 
        "hub.challenge"=>"41132213", 
        "hub.verify_token"=>"uQIUx8iou44wJvzV8utsqA2", 
        "controller"=>"api/v1/hooks/provider", 
        #"provider"=>"messenger", 
        #"app_key"=>app.key, 
        "id"=>@pkg.encoded_id
     }

      get(:process_event, params: params)
      expect(response.status).to be == 200
    end
  
    it "receive conversation data" do
      get(:process_event, 
        params: data_for({
          id: @pkg.encoded_id, 
          sender: owner, 
          recipient: messenger_user,
          message_data: {
            mid: "1234",
            text: "hip"
          }
        })
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.main_participant.name).to include("Mike Mich")
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it "receive conversation media" do

      get(:process_event, 
        params: data_for_media({
          id: @pkg.encoded_id, 
          sender: owner, 
          recipient: messenger_user,
          message_data: {
            mid: "1234",
            text: "hip"
          }
        })
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      #expect(message.messageable.serialized_content).to include('https://api.twilio.com/')
    end

    it "receive two messages in single conversation" do

      expect(app.app_users).to be_empty

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: messenger_user, 
        recipient: owner,
        message_data: {
          mid: "1234",
          text: "oli"
        }
        ))

      expect(app.app_users.size).to be == 1

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: messenger_user, 
        recipient: owner,
        message_data: {
          mid: "1235",
          text: "oli"
        }
      ))

      expect(app.app_users.size).to be == 1

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end 

    it "reply from agent on messenger" do

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: messenger_user, 
        recipient: owner,
        message_data: {
          mid: 1,
          text: "hip"
        }
      ))

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: owner, 
        recipient: messenger_user,
        message_data: {
          mid: 2,
          text: "hip",
          "is_echo"=>true,
        }
      ))

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
      expect(app.conversations.first.messages.last.authorable).to be_a(Agent)
    end

    it "receive text with breakline" do

      get(:process_event, params: data_for(
          id: @pkg.encoded_id, 
          sender: messenger_user, 
          recipient: owner,
          message_data: {
            mid: 1,
            "text"=> "one\ntwo\ntree\n✌️"
          }
        )
      )

      message = app.conversations.first.messages.first.messageable

      expect(message.html_content).to be == "one\ntwo\ntree\n✌️"
      expect(message.serialized_content).to be_present

      blocks = JSON.parse(message.serialized_content)["blocks"]

      expect(blocks.size).to be == 4
    end


  end

end