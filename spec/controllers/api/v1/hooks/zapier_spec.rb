require "rails_helper"
require "app_packages_catalog"

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  include ActiveJob::TestHelper

  def data_for_auth(id:, app:, token: "aaa", url: nil)
    {
      auth: token,
      url:,
      "id" => id.to_s
    }
  end

  def data_for_new_contact(id:, app:)
    {
      first_name: "",
      last_name: "",
      email: "aa@aa.cl",
      phone: "",
      company_name: "",
      event: "create_contact",
      "id" => id.to_s
    }
  end

  def data_for_new_conversation(id:, app:)
    {
      contact_email: "aa@aa.cl",
      message_text: "hello fakers",
      event: "new_conversation",
      "id" => id.to_s
    }
  end

  def data_for_polling(id:, event_type:)
    {
      event_type:,
      event: "perform_list",
      "id" => id.to_s
    }
  end

  def data_for_subscribe(id:, app:)
    {
      hookUrl: "https://hooks.zapier.com/hooks/standard/xxx/",
      event: "subscribe",
      event_type: "new_contact",
      "id" => id.to_s
    }
  end

  def data_for_unsubscribe(id:, app:)
    {
      hookUrl: "https://hooks.zapier.com/hooks/standard/xxx/",
      event: "unsubscribe",
      event_type: "new_contact",
      "id" => id.to_s
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:visitor) do
    app.add_anonymous_user({})
  end

  let!(:user) do
    app.add_user(email: "test@test.cl")
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl" })
  end

  let(:app_package) do
    AppPackage.find_by(name: "Zapier")
  end

  describe "hooks" do
    before :each do
      AppPackagesCatalog.update("Zapier")

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        app_package:,
        api_key: "aaa",
        access_token: "aaa"
      )
    end

    describe "auth" do
      it "validates ok" do
        response = post(
          :process_event,
          params: data_for_auth(
            id: @pkg.encoded_id,
            app:,
            token: "aaa",
            url: nil
          )
        )
        expect(JSON.parse(response.body)).to eql({ "app_name" => "my app", "status" => "ok" })
        response
      end

      it "validates nok" do
        response = post(
          :process_event,
          params: data_for_auth(
            id: @pkg.encoded_id,
            app:, token: "bbb",
            url: nil
          )
        )
        expect(JSON.parse(response.body)).to include({ "status" => "error" })
        expect(response).to_not be_ok
        expect(response.status).to be == 422
        response
      end
    end

    describe "actions" do
      it "receive new_contact" do
        response = post(
          :process_event,
          params: data_for_new_contact(id: @pkg.encoded_id, app:)
        )
        expect(JSON.parse(response.body).keys).to include("email")
      end

      it "receive new_conversation" do
        response = post(
          :process_event,
          params: data_for_new_conversation(id: @pkg.encoded_id, app:)
        )
        expect(JSON.parse(response.body).keys).to include("key")
        response
      end
    end

    it "subscribe hook" do
      response = post(
        :process_event,
        params: data_for_subscribe(id: @pkg.encoded_id, app:)
      )
      expect(JSON.parse(response.body)).to eql({ "status" => "ok" })
      expect(@pkg.reload.settings["new_contact"]).to be_present
      response
    end

    it "unsubscribe hook" do
      @pkg.settings["new_contact"] = "xxx"
      @pkg.save

      response = post(
        :process_event,
        params: data_for_unsubscribe(id: @pkg.encoded_id, app:)
      )
      expect(JSON.parse(response.body)).to eql({ "status" => "ok" })
      expect(@pkg.reload.settings["new_contact"]).to be_nil
      response
    end

    describe "triggers users" do
      it "does not notifies when no hook available" do
        perform_enqueued_jobs do
          expect_any_instance_of(
            MessageApis::Zapier::Api
          ).to_not receive(:post).once
          @pkg.app.app_users.create(email: "tutu@tata.cl")
        end
      end

      it "notifies users.created" do
        perform_enqueued_jobs do
          @pkg.settings[:user_created] = "https://hooks.zapier.com/hooks/xxx"
          @pkg.save
          @pkg.reload
          expect_any_instance_of(
            MessageApis::Zapier::Api
          ).to receive(:post).once
          @pkg.app.app_users.create(email: "tutu@tata.cl")
        end
      end
    end

    describe "triggers conversation" do
      it "notifies conversations.started" do
        perform_enqueued_jobs do
          @pkg.settings[:conversation_opened] = "https://hooks.zapier.com/hooks/xxx"
          @pkg.save
          @pkg.reload
          app_user = user

          expect_any_instance_of(
            MessageApis::Zapier::Api
          ).to receive(:post).once

          @pkg.app.start_conversation(
            message: { text_content: "aa" },
            from: app_user
          )
        end
      end

      it "notifies conversations.assigned" do
        perform_enqueued_jobs do
          @pkg.settings[:conversation_assigned] = "https://hooks.zapier.com/hooks/xxx"
          @pkg.save
          @pkg.reload
          app_user = user

          conversation = @pkg.app.start_conversation(
            message: { text_content: "aa" },
            from: app_user
          )

          expect_any_instance_of(
            MessageApis::Zapier::Api
          ).to receive(:post).once

          conversation.assign_user(agent_role.agent)
        end
      end

      it "notifies conversations.closed" do
        perform_enqueued_jobs do
          @pkg.settings[:conversation_closed] = "https://hooks.zapier.com/hooks/xxx"
          @pkg.save
          @pkg.reload
          app_user = user

          conversation = @pkg.app.start_conversation(
            message: { text_content: "aa" },
            from: app_user
          )

          expect_any_instance_of(
            MessageApis::Zapier::Api
          ).to receive(:post).once

          conversation.close
        end
      end
    end

    describe "perform_list" do
      it "conversation poll list" do
        response = post(
          :process_event,
          params: data_for_polling(
            id: @pkg.encoded_id,
            event_type: "conversation_assigned"
          )
        )

        expect(JSON.parse(response.body)).to be_a(Array)
        response
      end

      it "contact poll list" do
        response = post(
          :process_event,
          params: data_for_polling(
            id: @pkg.encoded_id,
            event_type: "contact_created"
          )
        )

        expect(JSON.parse(response.body)).to be_a(Array)
        response
      end
    end
  end
end
