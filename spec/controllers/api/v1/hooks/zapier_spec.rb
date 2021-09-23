require "rails_helper"
require "app_packages_catalog"

RSpec.describe Api::V1::Hooks::ProviderController, type: :controller do
  include ActiveJob::TestHelper

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
      AppPackagesCatalog.update_all
      ActiveJob::Base.queue_adapter = :test
      ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false

      AppPackageIntegration.any_instance
                           .stub(:handle_registration)
                           .and_return({})

      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        app_package: app_package,
        api_key: "aaa",
        access_token: "aaa"
      )
    end

    it "receive hook" do
      response = post(
        :process_event,
        params: data_for_new_contact(id: @pkg.encoded_id, app: app)
      )
      expect(JSON.parse(response.body).keys).to include("email")
      response
    end
  end
end
