# frozen_string_literal: true

require "rails_helper"

RSpec.describe PluggableManager do
  after :each do
    subject.uninstall
  end

  it "install" do
    subject.plugin = "foo"
    subject.install

    expect(
      subject
    ).to be_installed

    expect(
      AppPackage.find_by(name: "Foo")
    ).to be_present
  end

  it "install validation" do
    subject.plugin = "foo"
    subject.install
    expect do
      subject.install
    end.to raise_error
  end

  it "reinstall validation" do
    subject.plugin = "foo"
    subject.install
    expect(subject).to be_installed
    expect do
      subject.reinstall
    end.to_not raise_error
  end

  it "uninstall" do
    subject.plugin = "foo"
    subject.install
    expect(subject).to be_installed
    subject.uninstall
    expect(subject).to_not be_installed
  end
end
