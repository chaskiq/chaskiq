require "rails_helper"

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  include ActiveJob::TestHelper

  let(:owner_phone) do
    "1111"
  end

  let(:user_phone) do
    "2222"
  end

  def data_for(id:, sender:, message_id: nil, message_data: {})
    {
      update_id: 779_649_024,
      message: {
        message_id:,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_603_019,
        text: message_data["text"] || "hey!"
      },

      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_media(id:, sender:, message_id: nil, message_data: {})
    {

      update_id: 779_649_030,
      message: {
        message_id:,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_633_532,
        animation: {
          file_name: "@KoksalGif - 3460.gif.mp4",
          mime_type: "video/mp4",
          duration: 6,
          width: 316,
          height: 320,
          thumb: {
            file_id: "AAMCAgADGQEAAxZhQMB8gOAAAVyuph7F3adGf9CKF2MAAtkGAALIYwhKcxVSFXYKQHUBAAdtAAMgBA",
            file_unique_id: "AQAD2QYAAshjCEpy",
            file_size: 14_509,
            width: 315,
            height: 320
          },
          file_id: "CgACAgIAAxkBAAMWYUDAfIDgAAFcrqYexd2nRn_QihdjAALZBgACyGMISnMVUhV2CkB1IAQ",
          file_unique_id: "AgAD2QYAAshjCEo",
          file_size: 90_400
        },
        document: {
          file_name: "@KoksalGif - 3460.gif.mp4",
          mime_type: "video/mp4",
          thumb: {
            file_id: "AAMCAgADGQEAAxZhQMB8gOAAAVyuph7F3adGf9CKF2MAAtkGAALIYwhKcxVSFXYKQHUBAAdtAAMgBA",
            file_unique_id: "AQAD2QYAAshjCEpy",
            file_size: 14_509,
            width: 315,
            height: 320
          },
          file_id: "CgACAgIAAxkBAAMWYUDAfIDgAAFcrqYexd2nRn_QihdjAALZBgACyGMISnMVUhV2CkB1IAQ",
          file_unique_id: "AgAD2QYAAshjCEo",
          file_size: 90_400
        }
      },

      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_audio(id:, sender:, message_id: nil, message_data: {})
    {
      update_id: 779_649_032,
      message: {
        message_id:,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_674_175,
        voice: {
          duration: 4,
          mime_type: "audio/ogg",
          file_id: "AwACAgEAAxkBAAMeYUFfPxq6g7RI__x1JODaKa0YDhwAAmABAAJTPBBGfwxFZti0lQkgBA",
          file_unique_id: "AgADYAEAAlM8EEY",
          file_size: 26_087
        }
      },
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_video(id:, sender:, message_id: nil, message_data: {})
    {
      update_id: 779_649_035,
      message: {
        message_id: 33,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_676_328,
        animation: {
          file_name: "E5eTEjNXMAUYXfJ.mp4",
          mime_type: "video/mp4",
          duration: 6,
          width: 336,
          height: 320,
          thumb: {
            file_id: "AAMCAQADGQEAAyFhQWeoUPChcGb14kZe2k-_GOCM0wACYgEAAlM8EEYyYeCv-Up6CQEAB20AAyAE",
            file_unique_id: "AQADYgEAAlM8EEZy",
            file_size: 12_675,
            width: 320,
            height: 305
          },
          file_id: "CgACAgEAAxkBAAMhYUFnqFDwoXBm9eJGXtpPvxjgjNMAAmIBAAJTPBBGMmHgr_lKegkgBA",
          file_unique_id: "AgADYgEAAlM8EEY",
          file_size: 86_980
        },
        document: {
          file_name: "E5eTEjNXMAUYXfJ.mp4",
          mime_type: "video/mp4",
          thumb: {
            file_id: "AAMCAQADGQEAAyFhQWeoUPChcGb14kZe2k-_GOCM0wACYgEAAlM8EEYyYeCv-Up6CQEAB20AAyAE",
            file_unique_id: "AQADYgEAAlM8EEZy",
            file_size: 12_675,
            width: 320,
            height: 305
          },
          file_id: "CgACAgEAAxkBAAMhYUFnqFDwoXBm9eJGXtpPvxjgjNMAAmIBAAJTPBBGMmHgr_lKegkgBA",
          file_unique_id: "AgADYgEAAlM8EEY",
          file_size: 86_980
        },
        caption: "hello"
      },
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_image(id:, sender:, message_id: nil, message_data: {})
    {
      message: {
        message_id: 32,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_675_712,
        photo: [
          {
            file_id: "AgACAgEAAxkBAAMgYUFlQDPVTLa3N0MMVSiYOlDDlwEAAl6qMRtTPBBGkP7Xqc4QJHsBAAMCAANzAAMgBA",
            file_unique_id: "AQADXqoxG1M8EEZ4",
            file_size: 1329,
            width: 67,
            height: 90
          },
          {
            file_id: "AgACAgEAAxkBAAMgYUFlQDPVTLa3N0MMVSiYOlDDlwEAAl6qMRtTPBBGkP7Xqc4QJHsBAAMCAANtAAMgBA",
            file_unique_id: "AQADXqoxG1M8EEZy",
            file_size: 20_068,
            width: 240,
            height: 320
          },
          {
            file_id: "AgACAgEAAxkBAAMgYUFlQDPVTLa3N0MMVSiYOlDDlwEAAl6qMRtTPBBGkP7Xqc4QJHsBAAMCAAN4AAMgBA",
            file_unique_id: "AQADXqoxG1M8EEZ9",
            file_size: 78_945,
            width: 600,
            height: 800
          },
          {
            file_id: "AgACAgEAAxkBAAMgYUFlQDPVTLa3N0MMVSiYOlDDlwEAAl6qMRtTPBBGkP7Xqc4QJHsBAAMCAAN5AAMgBA",
            file_unique_id: "AQADXqoxG1M8EEZ-",
            file_size: 88_510,
            width: 867,
            height: 1156
          }
        ],
        caption: "oliii"
      },
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  def data_for_errors(id:, sender:, message_id: nil, message_data: {})
    {
      statuses: [
        {
          errors: [
            {
              code: 470,
              href: "https://developers.facebook.com/docs/whatsapp/api/errors/",
              title: "Message failed to send because more than 24 hours have passed since the customer last replied to this number"
            }
          ],
          id: message_id,
          recipient_id: "56992302305",
          status: "failed",
          timestamp: "1616908033"
        }
      ],
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => id
    }
  end

  def data_for_sticker(id:, sender:, message_id: nil, message_data: {})
    {
      update_id: 779_649_031,
      message: {
        message_id:,
        from: {
          id: sender,
          is_bot: false,
          first_name: "Miguel",
          last_name: "Michelson",
          language_code: "en"
        },
        chat: {
          id: sender,
          first_name: "Miguel",
          last_name: "Michelson",
          type: "private"
        },
        date: 1_631_673_514,
        sticker: {
          width: 512,
          height: 512,
          emoji: "😂",
          set_name: "HotCherry",
          is_animated: true,
          thumb: {
            file_id: "AAMCAgADGQEAAx1hQVyqbuun9bpvoJvkyacBz9BogQACAQADwDZPExguczCrPy1RAQAHbQADIAQ",
            file_unique_id: "AQADAQADwDZPE3I",
            file_size: 2750,
            width: 128,
            height: 128
          },
          file_id: "CAACAgIAAxkBAAMdYUFcqm7rp_W6b6Cb5MmnAc_QaIEAAgEAA8A2TxMYLnMwqz8tUSAE",
          file_unique_id: "AgADAQADwDZPEw",
          file_size: 8244
        }
      },
      "controller" => "api/v1/hooks/provider",
      "action" => "process_event",
      "provider" => "telegram",
      "app_key" => app.key,
      "id" => @pkg.encoded_id
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:app_package) do
    1
    AppPackage.find_by(name: "Telegram")
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

      @pkg = app.app_package_integrations.create(
        access_token: "aaa",
        user_id: owner_phone,
        app_package:,
        sandbox: true
      )

      allow_any_instance_of(MessageApis::Telegram::Api).to receive(
        :handle_direct_upload
      ).and_return({ url: "/direct-upload-mock" })
    end

    it "receive conversation data" do
      get(:process_event,
          params: data_for(id: @pkg.id,
                           sender: owner_phone,
                           message_id: "1234"))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any
      expect(app.conversations.last.main_participant.name).to eql("Miguel Michelson")
      expect(app.conversations.last.messages.last.conversation_part_channel_sources).to be_any
    end

    it "receive conversation media" do
      get(:process_event,
          params: data_for_media(
            id: @pkg.id,
            sender: owner_phone,
            message_id: "1234"
          ))

      perform_enqueued_jobs

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("/direct-upload-mock")
    end

    it "receive conversation sticker" do
      get(:process_event,
          params: data_for_sticker(
            id: @pkg.id,
            sender: owner_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("/direct-upload-mock")
    end

    it "receive conversation audio" do
      get(:process_event,
          params: data_for_audio(
            id: @pkg.id,
            sender: owner_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("/direct-upload-mock")
    end

    it "receive conversation video" do
      get(:process_event,
          params: data_for_video(
            id: @pkg.id,
            sender: owner_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("/direct-upload-mock")
    end

    it "receive conversation image" do
      get(:process_event,
          params: data_for_image(
            id: @pkg.id,
            sender: owner_phone,
            message_id: "1234"
          ))
      perform_enqueued_jobs
      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.last.messages).to be_any

      message = app.conversations.last.messages.last
      expect(message.conversation_part_channel_sources).to be_any
      expect(message.messageable.serialized_content).to include("/direct-upload-mock")
    end

    it "receive two messages in single conversation" do
      expect(app.app_users).to be_empty

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        message_id: "1234"
      ))
      perform_enqueued_jobs

      expect(app.app_users.size).to be == 1

      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        message_id: "1235"
      ))
      perform_enqueued_jobs

      expect(app.app_users.size).to be == 1

      expect(response.status).to be == 200
      expect(app.conversations.count).to be == 1
      expect(app.conversations.first.messages.count).to be == 2
    end

    it "receive text with breakline" do
      get(:process_event, params: data_for(
        id: @pkg.id,
        sender: user_phone,
        message_data: {
          "text" => "one\ntwo\ntree\n✌️"
        }
      ))
      perform_enqueued_jobs

      message = app.conversations.first.messages.first.messageable

      expect(message.html_content).to be == "one\ntwo\ntree\n✌️"
      expect(message.serialized_content).to be_present

      blocks = JSON.parse(message.serialized_content)["blocks"]

      expect(blocks.size).to be == 4
    end
  end
end
