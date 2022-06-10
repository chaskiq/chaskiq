# frozen_string_literal: true

require "rails_helper"

RSpec.describe AppPackage, type: :model do
  it "create" do
    definitions = [{
      name: "api_secret",
      type: "string",
      grid: { xs: 12, sm: 12 }
    }]
    package = AppPackage.create(name: "any", definitions: definitions)

    expect(package.name).to be_present
    expect(package.definitions).to be_present
    expect(package.definitions.size).to be == 1
    expect(package).to be_is_external
  end

  describe "external" do
    it "is external" do
      settings = JSON.parse("{\"oauth_url\":\"\",\"initialize_url\":\"https://domain.com/initialize\",\"configure_url\":\"https://domain.com/configure\",\"submit_url\":\"https://domain.com/submit\",\"sheet_url\":\"https://domain.com/frame\",\"definitions\":[{\"name\":\"access_token\",\"type\":\"string\",\"grid\":{\"xs\":\"w-full\",\"sm\":\"w-full\"}}]}")
      package = AppPackage.create(name: "any", settings: settings)
      expect(package).to be_is_external
    end
  end
end
