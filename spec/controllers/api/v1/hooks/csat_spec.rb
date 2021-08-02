require "rails_helper"
include ActiveJob::TestHelper

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:user) do
    app.add_user(email: "test@test.cl")
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:app_package) do
    AppPackage.find_by(name: "Csat")
  end

  let(:conversation) do
    app.start_conversation(
      message: { html_content: "This is a test" },
      from: user
    )
  end

  describe "trigger on close" do
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
        api_secret: "sk-xxx",
        app_package: app_package
      )
    end

    describe "single hook" do
      it "receive message" do
        serialized = "{\"blocks\":
        [{\"key\":\"bl82q\",\"text\":\"bar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
        \"entityMap\":{}}"

        perform_enqueued_jobs do
          message = conversation.add_message(
            from: user,
            message: {
              html_content: "foo",
              serialized_content: serialized
            }
          )

          conversation.close!
        end

        expect(conversation.messages.last.message).to be_an_instance_of ConversationPartBlock
      end
    end
  end
end
