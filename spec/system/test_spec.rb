require "rails_helper"

RSpec.describe "Widget management", :type => :system do
  before do
    #driven_by(:rack_test)
    driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  end

  it "enables me to create widgets" do
    app = FactoryGirl.create(:app, 
                              encryption_key: "unodostrescuatro",
                              active_messenger: true,
                              state: 'enabled')
                              
    visit "/tester"

    expect(page).to have_text("Hello")
    expect(page).to have_text("miguel")
    expect(page).to have_text(app.key)
    expect(AppUser.count).to be == 1
    expect(AppUser.first.properties).to_not be_blank
    expect(AppUser.first.last_visited_at).to_not be_blank
    expect(AppUser.first.referrer).to_not be_blank
    expect(AppUser.first.lat).to_not be_blank
    expect(AppUser.first.lng).to_not be_blank
    expect(AppUser.first.os).to_not be_blank
    expect(AppUser.first.os_version).to_not be_blank
    expect(AppUser.first.browser).to_not be_blank
    expect(AppUser.first.browser_version).to_not be_blank
    expect(AppUser.first.browser_language).to_not be_blank
  end

end
