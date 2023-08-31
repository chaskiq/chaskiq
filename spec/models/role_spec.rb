# frozen_string_literal: true

require "rails_helper"

RSpec.describe Role, type: :model do
  # it{ should belong_to(:user) }
  # it{ should belong_to(:app) }

  let(:app) do
    FactoryBot.create :app
  end

  it "role" do
    user = Agent.create(
      email: Faker::Internet.email,
      password: Devise.friendly_token[0, 20]
    )

    app.add_admin(user)
    expect(app.agents).to be_include(user)
  end

  it "access module" do
    expect(PermissionsService.allowed_access_to?(:admin_only, :conversations)).to be_falsey
  end
end
