require "rails_helper"

RSpec.describe "Widget management", :type => :system do

  let!(:app){
    FactoryGirl.create(:app, encryption_key: "unodostrescuatro",
                              active_messenger: "true",
                              state: 'enabled')
  }

  let!(:user){
    app.add_user({email: "test@test.cl"})
  }

  let!(:agent_role){
    app.add_agent({email: "test2@test.cl"})
  }

  before do
    options = ENV.fetch("CI") ? 
    
    {
      args: ["headless", "disable-gpu", "no-sandbox", "disable-dev-shm-usage"] ,
      options: {binary: ENV.fetch('GOOGLE_CHROME_BIN')}
    } : {}

    driven_by :selenium, using: :chrome, screen_size: [1400, 1400],
     options: options
  end

  it "enables me to create widgets" do                       
    visit "/tester"

    #sleep()

    #expect(page).to have_text("Hello")
    #expect(page).to have_text("miguel")
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
