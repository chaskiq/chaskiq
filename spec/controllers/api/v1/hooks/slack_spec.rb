require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  let(:slack_owner) do
    {
    }
  end

  let(:slack_user) do
    {

    }
  end

  ## bot giphy images
  let(:giphy_images_content) do
    { 'bot_id' => 'BRMFTGU0M',
      'type' => 'message',
      'text' => 'oli',
      'user' => 'UR2A93SRK',
      'ts' => '1594871580.009800',
      'team' => 'TQUC0ASKT',
      'bot_profile' =>
       { 'id' => 'BRMFTGU0M',
         'deleted' => false,
         'name' => 'giphy',
         'updated' => 1_576_177_886,
         'app_id' => 'A0F827J2C',
         'icons' =>
         { 'image_36' => 'https://a.slack-edge.com/dc483/img/plugins/giphy/service_72.png',
           'image_48' => 'https://a.slack-edge.com/dc483/img/plugins/giphy/service_48.png',
           'image_72' => 'https://a.slack-edge.com/dc483/img/plugins/giphy/service_72.png' },
         'team_id' => 'TQUC0ASKT' },
      'blocks' =>
       [{ 'type' => 'image',
          'block_id' => '3tq8',
          'image_url' =>
          'https://media1.giphy.com/media/h4f1jbWGaAEmhsPKgm/giphy-downsized.gif?cid=6104955edb49637847dd3757de339fc9e299f1de3bbdf9b1&rid=giphy-downsized.gif',
          'alt_text' => 'oli',
          'title' => { 'type' => 'plain_text', 'text' => 'oli', 'emoji' => true },
          'fallback' => '336x336px image',
          'image_width' => 336,
          'image_height' => 336,
          'image_bytes' => 1_665_779,
          'is_animated' => true },
        { 'type' => 'context',
          'block_id' => '+AcM',
          'elements' =>
          [{ 'fallback' => '32x32px image',
             'image_url' => 'https://a.slack-edge.com/dc483/img/plugins/giphy/service_32.png',
             'image_width' => 32,
             'image_height' => 32,
             'image_bytes' => 603,
             'type' => 'image',
             'alt_text' => 'giphy logo' },
           { 'type' => 'mrkdwn',
             'text' => 'Posted using /giphy | GIF by <https://giphy.com/SWR-Kindernetz/|SWR Kindernetz>',
             'verbatim' => false }] }],
      'parent_user_id' => 'U015X9F5AD7',
      'event_ts' => '1594871580.009800',
      'channel_type' => 'channel' }
  end

  # multiple lines &
  let(:multiple_lines_content) do
    {
      'type' => 'message',
      'text' => "okokoko\ndsocsdokcosdkc\nsdcoksdcodsc",
      'files' =>
        [{ 'id' => 'F017K1PTCTB',
           'created' => 1_594_870_622,
           'timestamp' => 1_594_870_622,
           'name' => 'Captura de pantalla 2020-07-14 a la(s) 17.51.12.png',
           'title' => 'Captura de pantalla 2020-07-14 a la(s) 17.51.12.png',
           'mimetype' => 'image/png',
           'filetype' => 'png',
           'pretty_type' => 'PNG',
           'user' => 'UR2A93SRK',
           'editable' => false,
           'size' => 51_822,
           'mode' => 'hosted',
           'is_external' => false,
           'external_type' => '',
           'is_public' => true,
           'public_url_shared' => false,
           'display_as_bot' => false,
           'username' => '',
           'url_private' =>
          'https://files.slack.com/files-pri/TQUC0ASKT-F017K1PTCTB/captura_de_pantalla_2020-07-14_a_la_s__17.51.12.png',
           'url_private_download' =>
          'https://files.slack.com/files-pri/TQUC0ASKT-F017K1PTCTB/download/captura_de_pantalla_2020-07-14_a_la_s__17.51.12.png',
           'thumb_64' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F017K1PTCTB-95df27f537/captura_de_pantalla_2020-07-14_a_la_s__17.51.12_64.png',
           'thumb_80' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F017K1PTCTB-95df27f537/captura_de_pantalla_2020-07-14_a_la_s__17.51.12_80.png',
           'thumb_360' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F017K1PTCTB-95df27f537/captura_de_pantalla_2020-07-14_a_la_s__17.51.12_360.png',
           'thumb_360_w' => 360,
           'thumb_360_h' => 267,
           'thumb_480' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F017K1PTCTB-95df27f537/captura_de_pantalla_2020-07-14_a_la_s__17.51.12_480.png',
           'thumb_480_w' => 480,
           'thumb_480_h' => 356,
           'thumb_160' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F017K1PTCTB-95df27f537/captura_de_pantalla_2020-07-14_a_la_s__17.51.12_160.png',
           'original_w' => 569,
           'original_h' => 422,
           'thumb_tiny' =>
          'AwAjADCkMHrSnA9KTGR2oxigBKKKKACiiigBQcUFiaFx3p2B7fnQAyinHGO34UbR60ANopSvuPzoIx3H4GgAI+UUlOP3FptA2FFFFAgooooA/9k=',
           'permalink' =>
          'https://chaskiq.slack.com/files/UR2A93SRK/F017K1PTCTB/captura_de_pantalla_2020-07-14_a_la_s__17.51.12.png',
           'permalink_public' =>
          'https://slack-files.com/TQUC0ASKT-F017K1PTCTB-e0164c3fcb',
           'has_rich_preview' => false }],
      'upload' => false,
      'blocks' =>
        [{ 'type' => 'rich_text',
           'block_id' => 'ujt',
           'elements' =>
          [{ 'type' => 'rich_text_section',
             'elements' =>
              [{ 'type' => 'text',
                 'text' => "okokoko\ndsocsdokcosdkc\nsdcoksdcodsc" }] }] }],
      'user' => 'UR2A93SRK',
      'display_as_bot' => false,
      'ts' => '1594870635.008700',
      'parent_user_id' => 'U015X9F5AD7',
      'subtype' => 'file_share',
      'event_ts' => '1594870635.008700',
      'channel_type' => 'channel'
    }
  end

  # with files
  let(:files_content) do
    {
      'type' => 'message',
      'text' => 'plplplpl',
      'files' =>
        [{ 'id' => 'F016RLCADJB',
           'created' => 1_594_870_713,
           'timestamp' => 1_594_870_713,
           'name' => 'Captura de pantalla 2020-07-08 a la(s) 09.36.04.png',
           'title' => 'Captura de pantalla 2020-07-08 a la(s) 09.36.04.png',
           'mimetype' => 'image/png',
           'filetype' => 'png',
           'pretty_type' => 'PNG',
           'user' => 'UR2A93SRK',
           'editable' => false,
           'size' => 63_059,
           'mode' => 'hosted',
           'is_external' => false,
           'external_type' => '',
           'is_public' => true,
           'public_url_shared' => false,
           'display_as_bot' => false,
           'username' => '',
           'url_private' =>
          'https://files.slack.com/files-pri/TQUC0ASKT-F016RLCADJB/captura_de_pantalla_2020-07-08_a_la_s__09.36.04.png',
           'url_private_download' =>
          'https://files.slack.com/files-pri/TQUC0ASKT-F016RLCADJB/download/captura_de_pantalla_2020-07-08_a_la_s__09.36.04.png',
           'thumb_64' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F016RLCADJB-3d514c52ad/captura_de_pantalla_2020-07-08_a_la_s__09.36.04_64.png',
           'thumb_80' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F016RLCADJB-3d514c52ad/captura_de_pantalla_2020-07-08_a_la_s__09.36.04_80.png',
           'thumb_360' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F016RLCADJB-3d514c52ad/captura_de_pantalla_2020-07-08_a_la_s__09.36.04_360.png',
           'thumb_360_w' => 206,
           'thumb_360_h' => 119,
           'thumb_160' =>
          'https://files.slack.com/files-tmb/TQUC0ASKT-F016RLCADJB-3d514c52ad/captura_de_pantalla_2020-07-08_a_la_s__09.36.04_160.png',
           'original_w' => 206,
           'original_h' => 119,
           'thumb_tiny' =>
          'AwAbADDPAoY44FKKCvegY0Einq2TinDpxTduHNMLDqQ0tNNACClJ4phOCQKTqKQEgfvSb+STTF5IobrQFyXdmkNRVJ2oEf/Z',
           'permalink' =>
          'https://chaskiq.slack.com/files/UR2A93SRK/F016RLCADJB/captura_de_pantalla_2020-07-08_a_la_s__09.36.04.png',
           'permalink_public' =>
          'https://slack-files.com/TQUC0ASKT-F016RLCADJB-7f8a06bcb2',
           'has_rich_preview' => false },
         { 'id' => 'F017CJ7V1AQ',
           'created' => 1_594_870_726,
           'timestamp' => 1_594_870_726,
           'name' => 'Captura de pantalla 2020-07-08 a la(s) 16.35.15.png',
           'title' => 'Captura de pantalla 2020-07-08 a la(s) 16.35.15.png',
           'mimetype' => 'image/png',
           'filetype' => 'png',
           'pretty_type' => 'PNG',
           'user' => 'UR2A93SRK',
           'editable' => false,
           'size' => 48_233,
           'mode' => 'hosted',
           'is_external' => false,
           'external_type' => '',
           'is_public' => true,
           'public_url_shared' => false,
           'display_as_bot' => false,
           'username' => '',
           'url_private' =>
           'https://files.slack.com/files-pri/TQUC0ASKT-F017CJ7V1AQ/captura_de_pantalla_2020-07-08_a_la_s__16.35.15.png',
           'url_private_download' =>
           'https://files.slack.com/files-pri/TQUC0ASKT-F017CJ7V1AQ/download/captura_de_pantalla_2020-07-08_a_la_s__16.35.15.png',
           'thumb_64' =>
           'https://files.slack.com/files-tmb/TQUC0ASKT-F017CJ7V1AQ-da86263119/captura_de_pantalla_2020-07-08_a_la_s__16.35.15_64.png',
           'thumb_80' =>
           'https://files.slack.com/files-tmb/TQUC0ASKT-F017CJ7V1AQ-da86263119/captura_de_pantalla_2020-07-08_a_la_s__16.35.15_80.png',
           'thumb_360' =>
           'https://files.slack.com/files-tmb/TQUC0ASKT-F017CJ7V1AQ-da86263119/captura_de_pantalla_2020-07-08_a_la_s__16.35.15_360.png',
           'thumb_360_w' => 360,
           'thumb_360_h' => 92,
           'thumb_480' =>
           'https://files.slack.com/files-tmb/TQUC0ASKT-F017CJ7V1AQ-da86263119/captura_de_pantalla_2020-07-08_a_la_s__16.35.15_480.png',
           'thumb_480_w' => 480,
           'thumb_480_h' => 122,
           'thumb_160' =>
           'https://files.slack.com/files-tmb/TQUC0ASKT-F017CJ7V1AQ-da86263119/captura_de_pantalla_2020-07-08_a_la_s__16.35.15_160.png',
           'original_w' => 598,
           'original_h' => 152,
           'thumb_tiny' =>
           'AwAMADC2ElWV2aTKH7oHanZPqfzqXrSYHoKAGZOOtG40/aPQUbRnNADN59qcpz1FLgeg/KloA//Z',
           'permalink' =>
           'https://chaskiq.slack.com/files/UR2A93SRK/F017CJ7V1AQ/captura_de_pantalla_2020-07-08_a_la_s__16.35.15.png',
           'permalink_public' =>
           'https://slack-files.com/TQUC0ASKT-F017CJ7V1AQ-e7c034c6a6',
           'has_rich_preview' => false }],
      'upload' => false,
      'blocks' =>
        [{ 'type' => 'rich_text',
           'block_id' => 'nqEvv',
           'elements' =>
          [{ 'type' => 'rich_text_section',
             'elements' => [{ 'type' => 'text', 'text' => 'plplplpl' }] }] }],
      'user' => 'UR2A93SRK',
      'ts' => '1594870731.009100',
      'parent_user_id' => 'U015X9F5AD7',
      'subtype' => 'file_share',
      'event_ts' => '1594870731.009100',
      'channel_type' => 'channel'
    }
  end

  def message_blocks(global: false, channel: nil, additional_data: nil, message: 'the message')
    payload = {
      'team_id' => 'TQUC0ASKT',
      'event' => {
        'client_msg_id' => 'xxx',
        'type' => 'message',
        'text' => message,
        'user' => 'AAAAA',
        'ts' => '1580785266.001000',
        'thread_ts' => '123',
        'blocks' =>
        [{ 'type' => 'rich_text',
           'block_id' => 'n+w',
           'elements' => [{ 'type' => 'rich_text_section',
                            'elements' => [{ 'type' => 'text', 'text' => message }] }] }],
        'channel' => channel,
        'event_ts' => '1580785266.001000',
        'channel_type' => 'channel'
      }
    }

    payload.deep_merge!({ 'event' => additional_data }) if additional_data

    if global
      return payload.merge!({
                              'provider' => 'slack'
                            })
    end

    payload.merge!({
                     'id' => @pkg.encoded_id
                   })
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: 'test@test.cl')
  end

  let!(:agent_role) do
    app.add_agent({ email: 'test2@test.cl' })
  end

  let(:app_package) do
    AppPackage.find_by(name: 'Slack')
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: 'message' },
      from: user
    )
  end

  describe 'triggers' do
    before do
      AppPackagesCatalog.update_all
    end
    before :each do
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true

      @pkg = app.app_package_integrations.create(
        api_secret: 'aaa',
        api_key: 'aaa',
        access_token: 'aaa',
        access_token_secret: 'aaa',
        app_package: app_package,
        external_id: 'TQUC0ASKT'
      )
    end

    it 'triggers on conversation first user message' do
      AppUser.any_instance
             .stub(:last_visited_at)
             .and_return(Time.now)

      AppUser.any_instance
             .stub(:last_visited_at)
             .and_return(Time.now)

      AppUser.any_instance
             .stub(:last_visited_at)
             .and_return(Time.now)

      ConversationPartContent.any_instance.stub(:serialized_content)
                             .and_return(
                               '{"blocks": [{"key":"bl82q","text":"foobar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'
                             )

      MessageApis::Slack::Api.any_instance.stub(:post_message).and_return({ foo: 'stubbed' })

      MessageApis::Slack::Api.any_instance.stub(:json_body).and_return({ 'ok' => true, 'ts' => '123' })

      expect_any_instance_of(MessageApis::Slack::Api).to receive(:notify_added)

      perform_enqueued_jobs do
        conversation
      end
    end
  end

  describe 'hooks' do
    before do
      AppPackagesCatalog.update_all
    end
    before :each do
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      conversation

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      MessageApis::Slack::Api.any_instance
                        .stub(:direct_upload)
                        .and_return('foobar')

      MessageApis::Slack::Api.any_instance
                        .stub(:create_channel)
                        .and_return({
                                      'channel' => { 'id' => 'abc' }
                                    })

      MessageApis::Slack::Api.any_instance
                        .stub(:join_channel)
                        .and_return({
                                      'channel' => { 'id' => 'abc' }
                                    })

      MessageApis::Slack::Api.any_instance
                        .stub(:update_reply_in_channel_message)
                        .and_return(OpenStruct.new(body: ':)'))

      @pkg = app.app_package_integrations.create(
        api_secret: 'aaa',
        api_key: 'aaa',
        access_token: 'aaa',
        access_token_secret: 'aaa',
        app_package: app_package,
        external_id: 'TQUC0ASKT'
      )
    end

    describe 'single hook' do
      it 'receive message' do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })

        channel = conversation.conversation_channels.find_by(provider: 'slack')

        get(:process_event, params: message_blocks(
          channel: channel.provider_channel_id
        ))

        expect(conversation.messages.last.authorable).to be_a(Agent)

        expect(conversation.messages.last.messageable.html_content).to be == 'the message'
      end

      it 'send message as an app user' do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })

        channel = conversation.conversation_channels.find_by(provider: 'slack')

        r = { ok: true, ts: '1234', thread_ts: '123' }
        MessageApis::Slack::Api.any_instance
                          .stub(:post_message)
                          .and_return(OpenStruct.new(body: r.to_json))

        perform_enqueued_jobs do
          message = conversation.add_message(
            from: user,
            message: { html_content: 'aa' }
          )
          expect(message.conversation_part_channel_sources).to be_any
        end
      end

      it 'send message as an app user with error' do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })

        channel = conversation.conversation_channels.find_by(provider: 'slack')

        r = { ok: false, ts: '1234' }
        MessageApis::Slack::Api.any_instance
                          .stub(:post_message)
                          .and_return(OpenStruct.new(body: r.to_json))

        perform_enqueued_jobs do
          message = conversation.add_message(
            from: user,
            message: { html_content: 'aa' }
          )
          expect(message.conversation_part_channel_sources).to be_blank
        end
      end
    end

    describe 'global hook' do
      before :each do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })
        @channel = conversation.conversation_channels.find_by(provider: 'slack')
      end

      it 'receive message' do
        get(:global_process_event, params: message_blocks(
          global: true,
          channel: @channel.provider_channel_id
        ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.html_content).to be == 'the message'
      end

      it 'receive message with emojis' do
        get(:global_process_event,
            params: message_blocks(
              global: true,
              channel: @channel.provider_channel_id,
              message: 'hello :+1: there'
            ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.html_content).to be == 'hello 👍 there'
      end

      it 'receive message with wrong emojis' do
        get(:global_process_event,
            params: message_blocks(
              global: true,
              channel: @channel.provider_channel_id,
              message: 'This is it: <https://www.google.com/es>'
            ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.html_content).to be == 'This is it: <https://www.google.com/es>'
      end

      it 'receive message double wrong emojis' do
        get(:global_process_event,
            params: message_blocks(
              global: true,
              channel: @channel.provider_channel_id,
              message: 'This is it: :smile::point_up: :+1:'
            ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.html_content).to be == 'This is it: 😄☝️ 👍'
      end

      it 'receive message multiline' do
        get(:global_process_event, params: message_blocks(
          global: true,
          additional_data: multiple_lines_content,
          channel: @channel.provider_channel_id
        ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.serialized_content).to include('okokoko')
        expect(conversation.messages.last.messageable.html_content).to be == "okokoko\ndsocsdokcosdkc\nsdcoksdcodsc"
      end

      it 'receive message giphy' do
        get(:global_process_event, params: message_blocks(
          global: true,
          additional_data: giphy_images_content,
          channel: @channel.provider_channel_id
        ))
        expect(conversation.messages.last.authorable).to be_a(Agent)
        expect(conversation.messages.last.messageable.serialized_content).to include('oli')
        expect(conversation.messages.last.messageable.html_content).to be == 'oli'
      end

      it 'send message as an app user' do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })

        channel = conversation.conversation_channels.find_by(provider: 'slack')

        r = { ok: true, ts: '1234', thread_ts: '123' }
        MessageApis::Slack::Api.any_instance
                          .stub(:post_message)
                          .and_return(OpenStruct.new(body: r.to_json))

        perform_enqueued_jobs do
          message = conversation.add_message(
            from: user,
            message: { html_content: 'aa' }
          )
          expect(message.conversation_part_channel_sources).to be_any
        end
      end

      it 'send message as an app user with error' do
        conversation.conversation_channels.create({
                                                    provider: 'slack',
                                                    provider_channel_id: '123'
                                                  })

        channel = conversation.conversation_channels.find_by(provider: 'slack')

        r = { ok: false, ts: '1234', thread_ts: '123' }
        MessageApis::Slack::Api.any_instance
                          .stub(:post_message)
                          .and_return(OpenStruct.new(body: r.to_json))

        perform_enqueued_jobs do
          message = conversation.add_message(
            from: user,
            message: { html_content: 'aa' }
          )
          expect(message.conversation_part_channel_sources).to be_blank
        end
      end
    end

    it 'receive two messages in single conversation' do
    end

    it 'reply from agent from slack' do
    end

    it 'receive text with video/gif' do
    end

    it 'receive text with photo' do
    end

    it 'send message' do
    end
  end
end
