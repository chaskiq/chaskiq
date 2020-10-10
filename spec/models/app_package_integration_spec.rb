# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppPackageIntegration, type: :model do

  before :each do 
    AppPackagesCatalog.update_all
  end

  let(:app) do
    FactoryBot.create :app
  end

  it 'create with validations' do
    package = AppPackage.find_by(name: 'Twitter')
    record = app.app_package_integrations.create(
      app_package: package
    )
    expect(record.errors).to be_any
  end

  it "handle registrations" do
    package = AppPackage.find_by(name: 'Twitter')
    expect_any_instance_of(AppPackageIntegration).to receive(:register_hook)
    record = app.app_package_integrations.create(
      app_package: package, 
      api_secret: '12344',
      access_token: '12343',
      api_key: '12334',
      access_token_secret: '12344'
    ) 
  end
end
