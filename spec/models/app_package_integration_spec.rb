# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppPackageIntegration, type: :model do
  let(:app) do
    FactoryBot.create :app
  end

  it 'create with validations' do
    definitions = [{
      name: 'api_secret',
      type: 'string',
      grid: { xs: 12, sm: 12 }
    }]
    package = AppPackage.create(name: 'slack', definitions: definitions)
    record = app.app_package_integrations.create(app_package: package)
    expect(record.errors).to be_any
  end

  it 'create without errors' do
    definitions = [{
      name: 'api_secret',
      type: 'string',
      grid: { xs: 12, sm: 12 }
    }]
    package = AppPackage.create(name: 'Slack', definitions: definitions)
    record = app.app_package_integrations.create(app_package: package, api_secret: '12344')
    expect(record.errors).to be_blank
    expect(record).to be_persisted
  end


  it "handle registrations" do
    definitions = [{
      name: 'api_secret',
      type: 'string',
      grid: { xs: 12, sm: 12 }
    }]
    package = AppPackage.create(name: 'Twitter', definitions: definitions)

    expect_any_instance_of(AppPackageIntegration).to receive(:register_hook)

    record = app.app_package_integrations.create(app_package: package, api_secret: '12344')

  end

  it "tags for events" do
    
    definitions = [{
      name: 'api_secret',
      type: 'string',
      grid: { xs: 12, sm: 12 }
    }]
    package = AppPackage.create(name: 'Twitter', definitions: definitions)

    expect_any_instance_of(AppPackageIntegration).to receive(:register_hook)

    record = app.app_package_integrations.create(app_package: package, api_secret: '12344')

  end
end
