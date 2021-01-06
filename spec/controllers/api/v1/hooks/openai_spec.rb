require 'rails_helper'
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do

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
    AppPackage.find_by(name: 'OpenAi')
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: 'This is a test' },
      from: user
    )
  end

  describe "triggers" do

    before do
      AppPackagesCatalog.update_all
    end

    before :each do 
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true

      @pkg = app.app_package_integrations.create(
        api_secret: "sk-N5sX2nLb6CxrEBcBkLtpN4mLnzoL5pAMBR06CBwo",
        app_package: app_package
      )
    end


    it "triggers on conversation first user message" do

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
        "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
      )

      perform_enqueued_jobs do
        conversation
      end
    end
  end


  describe "hooks" do
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

      @pkg = app.app_package_integrations.create(
        api_secret: "aaa"
      )

    end

    describe "single hook" do

      it "receive message" do
  
        conversation.conversation_channels.create({
          provider: 'open_ai',
          provider_channel_id: conversation.id
        })
  
        channel = conversation.conversation_channels.find_by(provider: "open_ai")
  
        get(:process_event, params: message_blocks(
          channel: channel.provider_channel_id)
        )
  
        expect(conversation.messages.last.authorable).to be_a(Agent)
  
        expect(conversation.messages.last.messageable.html_content).to be == "the message"
        
      end
  
    end


  end

end