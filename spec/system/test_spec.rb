require "rails_helper"

RSpec.describe "Widget management", :type => :system do
  before do
    #driven_by(:rack_test)
    driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  end

  it "enables me to create widgets" do
    visit "/"
    expect(page).to have_text("Widget was successfully created.")
  end

  it "enables me to create widgets" do
    visit "/tester"
    expect(page).to have_text("Hello")
  end

end
