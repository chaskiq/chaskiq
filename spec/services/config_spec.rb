# frozen_string_literal: true

require "rails_helper"

RSpec.describe Chaskiq::Config do
  subject { Chaskiq::Config }

  it "host will be present" do
    expect(subject.get("HOST")).to be_present
  end

  it "will be read from env" do
    ENV["HOST"] = "foo"
    expect(subject.get("HOST")).to be == "foo"
  end

  it "will be read from credentials" do
    allow_any_instance_of(ActiveSupport::EncryptedConfiguration).to receive(:config).and_return({ host: "bar" })

    ENV["HOST"] = "foo"
    expect(subject.get("HOST")).to be == "bar"
  end
end
