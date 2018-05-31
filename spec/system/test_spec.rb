require "rails_helper"

RSpec.describe "Widget management", :type => :system do
  before do
    #driven_by(:rack_test)
    driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  end

  it "enables me to create widgets" do
    app = FactoryGirl.create :app
    visit "/tester"
    expect(page).to have_text("Hello")
    expect(page).to have_text("miguel")
    expect(page).to have_text(app.key)
    expect(AppUser.count).to be == 1
    expect(AppUser.first.properties).to_not be_blank
  end

end
