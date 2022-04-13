# frozen_string_literal: true

require "rails_helper"

RSpec.describe AppPackageIntegration, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  let!(:agent_role) do
    app.add_agent({ email: "agent1@test.cl" })
  end

  before :each do
    AppPackagesCatalog.update_all
  end

  it "create with validations" do
    package = AppPackage.find_by(name: "Twitter")
    record = app.app_package_integrations.create(
      app_package: package
    )
    expect(record.errors).to be_any
  end

  it "handle registrations" do
    package = AppPackage.find_by(name: "Twitter")
    expect_any_instance_of(AppPackageIntegration).to receive(:register_hook)
    record = app.app_package_integrations.create(
      app_package: package,
      api_secret: "12344",
      access_token: "12343",
      api_key: "12334",
      access_token_secret: "12344"
    )

    expect(record).to be_persisted
    expect(record).to be_valid
    expect(record.errors).to_not be_any
  end

  it "handle registrations with validation on app package" do
    package = AppPackage.find_by(name: "Twitter")

    allow_any_instance_of(MessageApis::Twitter::Api).to receive(:validate_integration).and_return(["error"])

    record = app.app_package_integrations.create(
      app_package: package,
      api_secret: "12344",
      access_token: "12343",
      api_key: "12334",
      access_token_secret: "12344"
    )

    expect(record).to_not be_valid
    expect(record.errors).to be_any
  end

  describe "external packages" do
    let(:app_package) do
      settings = JSON.parse("{
        \"oauth_url\":\"\",
        \"api_url\":\"https://www.domain.com:4040/api\",
        \"initialize_url\":\"https://domain.com/initialize\",
        \"configure_url\":\"https://domain.com/configure\",
        \"submit_url\":\"https://domain.com/submit\",
        \"content_url\":\"https://domain.com/content\",
        \"sheet_url\":\"https://domain.com/frame\",
        \"definitions\":[{\"name\":\"access_token\",\"type\":\"string\",\"grid\":{\"xs\":\"w-full\",\"sm\":\"w-full\"}}]
      }")
      AppPackage.create(name: "any", settings:, author: agent_role.agent)
    end

    before :each do
      allow_any_instance_of(AppPackage).to receive(:api_url_challenge).and_return(true)
    end

    it "external app package" do
      expect(app_package).to be_is_external
    end

    it "add package" do
      integration = app.app_package_integrations.new
      integration.app_package = app_package
      integration.save
      expect(integration).to be_persisted
    end

    describe "persisted external" do
      let(:integration) do
        integration = app.app_package_integrations.new
        integration.app_package = app_package
        integration.save
        integration
      end

      it "trigger" do
        event = Event.new
        expect_any_instance_of(ExternalApiClient).to receive(:post).and_return(true)
        integration.trigger(event)
      end

      it "process_event" do
        params = { a: 1 }
        expect_any_instance_of(ExternalApiClient).to receive(:post).and_return(true)
        integration.process_event(params)
      end
    end
  end
end
