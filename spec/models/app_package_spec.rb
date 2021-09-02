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
end
