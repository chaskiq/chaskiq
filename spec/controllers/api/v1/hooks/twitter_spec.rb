require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do


  def crc_data(id)
    {
      "crc_token"=>"xxx", 
      "nonce"=>"xxxx", 
      #"app_key"=>app.key, 
      #"provider"=>"twitter", 
      "id"=>id
    }
  end

  let(:twitter_owner){
    { 
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
      }
    }
  }

  let(:twitter_user){
    {
      "1140620289006551040"=>{
        "id"=>"1140620289006551040", 
        "created_timestamp"=>"1560780043375", 
        "name"=>"Chaskiq", 
        "screen_name"=>"Chaskiqapp", 
        "description"=>"chaskiq is an open source solution for conversational marketing , repo at https://t.co/Ewm6NlNbb4", 
        "url"=>"https://t.co/GpWQHghDlj", 
        "protected"=>false, 
        "verified"=>false, 
        "followers_count"=>13, 
        "friends_count"=>99, 
        "statuses_count"=>1, 
        "profile_image_url"=>"http://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png", 
        "profile_image_url_https"=>"https://pbs.twimg.com/profile_images/1216829066944401414/Og9kvEko_normal.png"
      }
    }
  }

  def message_for(sender_id, recipient_id, message_data={}, message_id="1")

    message = {
      "text"=>"foobar", 
      "entities"=>{
        "hashtags"=>[], 
        "symbols"=>[], 
        "user_mentions"=>[], 
        "urls"=>[]
      }
    }.merge(message_data)

    {"type"=>"message_create", 
      "id"=> message_id, 
      "created_timestamp"=>"1579118212009", 
      "message_create"=>{
        "target"=>{
          "recipient_id"=>recipient_id.keys.first
        }, 
        "sender_id"=>sender_id.keys.first, 
        "message_data"=>message
      }
    }
  end

  let(:apps_data) do
    {
      "3033300"=>{
        "id"=>"3033300", 
        "name"=>"Twitter Web App", 
        "url"=>"https://mobile.twitter.com"
      }
    }
  end

  def data_for(id: , sender: , recipient: , message_id: nil, message_data: {} )
    {"for_user_id"=>twitter_owner.keys.first, 
      "direct_message_events"=> [message_for(
        sender, 
        recipient,
        message_data,
        message_id
      )],
      "users"=>twitter_owner.merge(twitter_user), 
      "app_key"=>app.key, 
      "provider"=>"twitter", 
      "id"=>id
    }
  end

  def entities()
    {
      "entities"=>{
        "hashtags"=>[], 
        "symbols"=>[], 
        "user_mentions"=>[], 
        "urls"=>[
          {
            "url"=>"https://t.co/EqgUwK77ad", 
            "expanded_url"=>"https://twitter.com/messages/media/1218022650947260420", 
            "display_url"=>"pic.twitter.com/EqgUwK77ad", 
            "indices"=>[1, 24]
          }
        ]
      }
    } 
  end

  def attachment
    {
      "attachment"=>{
        "type"=>"media", 
        "media"=>{
          "id"=>1218022642336325632, 
          "id_str"=>"1218022642336325632", 
          "indices"=>[1, 24], 
          "media_url"=>"https://pbs.twimg.com/dm_gif_preview/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.jpg", 
          "media_url_https"=>"https://pbs.twimg.com/dm_gif_preview/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.jpg", 
          "url"=>"https://t.co/EqgUwK77ad", 
          "display_url"=>"pic.twitter.com/EqgUwK77ad", 
          "expanded_url"=>"https://twitter.com/messages/media/1218022650947260420", 
          "type"=>"animated_gif", 
          "sizes"=>{
            "thumb"=>{
              "w"=>150, 
              "h"=>150, 
              "resize"=>"crop"
            }, 
            "large"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }, 
            "small"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }, 
            "medium"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }
          }, 
          "video_info"=>{
            "aspect_ratio"=>[131, 100], 
            "variants"=>[
              {
                "bitrate"=>0, 
                "content_type"=>"video/mp4", 
                "url"=>"https://video.twimg.com/dm_gif/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.mp4"
              }
            ]
          }
        }
      }
    }
  end

  def image_data
    {
      "text"=>" https://t.co/dOLqpmn7zX", 
      "entities"=>{
        "hashtags"=>[], 
        "symbols"=>[], 
        "user_mentions"=>[], 
        "urls"=>[
          {
            "url"=>"https://t.co/dOLqpmn7zX", 
            "expanded_url"=>"https://twitter.com/messages/media/1218168691763924998", 
            "display_url"=>"pic.twitter.com/dOLqpmn7zX", 
            "indices"=>[1, 24]
          }
        ]
      }, 
      "attachment"=>{
        "type"=>"media", 
        "media"=>{
          "id"=>1218168684226711552, 
          "id_str"=>"1218168684226711552", 
          "indices"=>[1, 24], 
          "media_url"=>"https://ton.twitter.com/1.1/ton/data/dm/1218168691763924998/1218168684226711552/7WY9gUyS.jpg", 
          "media_url_https"=>"https://ton.twitter.com/1.1/ton/data/dm/1218168691763924998/1218168684226711552/7WY9gUyS.jpg", 
          "url"=>"https://t.co/dOLqpmn7zX", 
          "display_url"=>"pic.twitter.com/dOLqpmn7zX", 
          "expanded_url"=>"https://twitter.com/messages/media/1218168691763924998", 
          "type"=>"photo", 
          "sizes"=>{
            "thumb"=>{
              "w"=>150, "h"=>150, "resize"=>"crop"
              }, 
            "small"=>{
                "w"=>680, 
                "h"=>680, 
                "resize"=>"fit"
              }, 
            "medium"=>{
                "w"=>1080, 
                "h"=>1080, 
                "resize"=>"fit"
              }, 
            "large"=>{
                "w"=>1080, 
                "h"=>1080, 
                "resize"=>"fit"
            }
          }
        }
      }
    }
  end

  def video_data

    {
      "text"=>" https://t.co/EqgUwK77ad", 
      "entities"=>{
        "hashtags"=>[], 
        "symbols"=>[], 
        "user_mentions"=>[], 
        "urls"=>[
          {
            "url"=>"https://t.co/EqgUwK77ad", 
            "expanded_url"=>"https://twitter.com/messages/media/1218022650947260420", 
            "display_url"=>"pic.twitter.com/EqgUwK77ad", 
            "indices"=>[1, 24]
          }
        ]
      }, 
      "attachment"=>{
        "type"=>"media", 
        "media"=>{
          "id"=>1218022642336325632, 
          "id_str"=>"1218022642336325632", 
          "indices"=>[1, 24], 
          "media_url"=>"https://pbs.twimg.com/dm_gif_preview/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.jpg", 
          "media_url_https"=>"https://pbs.twimg.com/dm_gif_preview/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.jpg", 
          "url"=>"https://t.co/EqgUwK77ad", 
          "display_url"=>"pic.twitter.com/EqgUwK77ad", 
          "expanded_url"=>"https://twitter.com/messages/media/1218022650947260420", 
          "type"=>"animated_gif", 
          "sizes"=>{
            "thumb"=>{
              "w"=>150, 
              "h"=>150, 
              "resize"=>"crop"
            }, 
            "large"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }, 
            "small"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }, 
            "medium"=>{
              "w"=>262, 
              "h"=>200, 
              "resize"=>"fit"
            }
          }, 
          "video_info"=>{
            "aspect_ratio"=>[131, 100], 
            "variants"=>[
              {
                "bitrate"=>0, 
                "content_type"=>"video/mp4", 
                "url"=>"https://video.twimg.com/dm_gif/1218022642336325632/UF-L2NL0RH3sLnu8V99AR2WbIYKXyy3OhL4E0YEw6cK-LcJ92Q.mp4"
              }
            ]
          }
        }
      }
    }

  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent_role) do
    app.add_agent({email: 'test2@test.cl'})
  end

  let(:app_package) do
    AppPackage.find_by(name: 'Twitter')
  end


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

      MessageApis::Twitter.any_instance
      .stub(:direct_upload)
      .and_return("foobar")
  
      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        api_key: "aaa",
        access_token: "aaa",
        access_token_secret: "aaa",
        app_package: app_package,
      )

    end

    it "receive challenge" do
      get(:process_event, params: crc_data(@pkg.encoded_id))
      expect(response.status).to be == 200
    end
  
    it "receive conversation data" do
      #allow_any_instance_of(MessageApis::Twitter).to receive(:handle_reply_in_channel_action).once

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_user, 
        recipient: twitter_owner)
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
    end  

    it "send message" do
      #channel = conversation.conversation_channels.find_by(provider: "slack")

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_user, 
        recipient: twitter_owner)
      )

      event = "{\"event\":{\"type\":\"message_create\",\"id\":\"1226014113735880708\",\"created_timestamp\":\"1581139517612\",\"message_create\":{\"target\":{\"recipient_id\":\"1140620289006551040\"},\"sender_id\":\"7472512\",\"message_data\":{\"text\":\"oopkpko\",\"entities\":{\"hashtags\":[],\"symbols\":[],\"user_mentions\":[],\"urls\":[]}}}}}"

      MessageApis::Twitter.any_instance
      .stub(:make_post_request)
      .and_return(event)


      serialized = "{\"blocks\":
      [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
      \"entityMap\":{}}"

      perform_enqueued_jobs do
        message = app.conversations.last.add_message(
          from: user,
          message: { html_content: 'aa', serialized_content: serialized }
        )
        expect(message.conversation_part_channel_sources).to be_any
      end
    end
    
    
    it "receive two messages in single conversation" do
      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_user, 
        recipient: twitter_owner)
      )
      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_user, 
        recipient: twitter_owner)
      )
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end 
    
    it "reply from agent on twitter" do

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_user, 
        recipient: twitter_owner,
        message_id: 1
        )
      )

      get(:process_event, params: data_for(
        id: @pkg.encoded_id, 
        sender: twitter_owner, 
        recipient: twitter_user,
        message_id: 2
      )
      )

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
      expect(app.conversations.first.messages.last.authorable).to be_a(Agent)
    end


    it "receive text with breakline" do

      get(:process_event, params: data_for(
          id: @pkg.encoded_id, 
          sender: twitter_user, 
          recipient: twitter_owner,
          message_data: {
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


    it "receive text with video/gif" do
      get(:process_event, params: data_for(
          id: @pkg.encoded_id, 
          sender: twitter_user, 
          recipient: twitter_owner,
          message_data: video_data
        )
      )

      message = app.conversations.first.messages.first.messageable

      blocks = JSON.parse(message.serialized_content)["blocks"]
      block  = blocks.first
      type = block["type"]
      expect(type).to be == "recorded-video"
    end

    it "receive text with photo" do

      get(:process_event, params: data_for(
          id: @pkg.encoded_id, 
          sender: twitter_user, 
          recipient: twitter_owner,
          message_data: image_data
        )
      )

      message = app.conversations.first.messages.first.messageable
      blocks = JSON.parse(message.serialized_content)["blocks"]
      block  = blocks.first
      type = block["type"]
      expect(type).to be == "image"
    end

    #it "reply from agent locally" do
    #  pending #("this test belongs to graphql insert comment")
    #end

    it "send message" do

      get(:process_event, params: data_for(
          id: @pkg.encoded_id, 
          sender: twitter_user, 
          recipient: twitter_owner,
          message_data: image_data
        )
      )

      conversation = app.conversations.first

      serialized = '{
        "blocks":
        [
          {
            "key":"f1qmb",
            "text":"pokpokpk",
            "type":"unstyled",
            "depth":0,
            "inlineStyleRanges":[],
            "entityRanges":[],
            "data":{}
          },
          {
            "key":"8pjai",
            "text":"",
            "type":"image",
            "depth":0,"inlineStyleRanges":[],"entityRanges":[],
            "data":{
              "aspect_ratio":{
                "width":1000,
                "height":539.2545598731166,
                "ratio":53.92545598731166},
                "width":1261,
                "caption":"type a caption (optional)",
                "height":680,
                "forceUpload":false,
                "url":"/Captura%20de%20pantalla%202019-12-12%20a%20la(s)%2000.50.23.png",
                "loading_progress":0,
                "selected":false,
                "loading":true,
                "file":{},
                "direction":"center"
              }
            }
        ],
          "entityMap":{}
        }'

      options = {
        from: app.agents.first,
        message: {
          html_content: "aa",
          serialized_content: serialized,
          text_content: serialized
        }
      }

      #MessageApis::Twitter.any_instance.stub(:upload_media).and_return({boomer: "1"})

      #expect_any_instance_of(MessageApis::Twitter).to receive(:make_post_request).with(any_args) 

      #conversation.conversation_source.deliver_message(options)

    end

  end

end