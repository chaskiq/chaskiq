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

  let(:serialized_content){
    "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
  }

  before do

    if ENV["CI"].present? 
      Selenium::WebDriver::Chrome::Service.driver_path = ENV.fetch('GOOGLE_CHROME_BIN', nil)
      options = Selenium::WebDriver::Chrome::Options.new
      options.binary = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
      driver = Selenium::WebDriver.for :chrome, options: options
    end

    options_for_selemium = ENV["CI"].present? ? 

    {
      args: ["headless", "disable-gpu", "no-sandbox", "disable-dev-shm-usage"] ,
    } : {}

    driven_by :selenium, using: :chrome, screen_size: [1400, 1400],
     options: options_for_selemium
  end

  it "renders messenger on registered users creating a app user" do                       
    visit "/tester/#{app.key}?sessionless=true"

    prime_iframe = all("iframe").first

    Capybara.within_frame(prime_iframe){ 
      page.find(".ckPVap").click 
    }

    # now 2nd iframe appears on top
    messenger_iframe = all("iframe").first

    Capybara.within_frame(messenger_iframe){ 
      page.has_content?("Hello!") 
    }

    expect(app.app_users.count).to be == 1
    expect(app.app_users.first.properties).to_not be_blank
    expect(app.app_users.first.last_visited_at).to_not be_blank
    expect(app.app_users.first.referrer).to_not be_blank
    expect(app.app_users.first.lat).to_not be_blank
    expect(app.app_users.first.lng).to_not be_blank
    expect(app.app_users.first.os).to_not be_blank
    expect(app.app_users.first.os_version).to_not be_blank
    expect(app.app_users.first.browser).to_not be_blank
    expect(app.app_users.first.browser_version).to_not be_blank
    expect(app.app_users.first.browser_language).to_not be_blank

    visit "/tester/#{app.key}"

    expect(app.app_users.count).to be == 1

  end


  it "renders messenger on registered users creating a app user" do                       
    
    app.start_conversation({
      message: {
        serialized_content: serialized_content
      }, 
      from: user
    })

    visit "/tester/#{app.key}"

    prime_iframe = all("iframe").first

    Capybara.within_frame(prime_iframe){ 
      page.find(".ckPVap").click 
    }

    # now 2nd iframe appears on top
    messenger_iframe = all("iframe").first

    Capybara.within_frame(messenger_iframe){ 
      page.has_content?("Hello!") 
    }

    Capybara.within_frame(messenger_iframe){
      page.has_content?(user.email)
    }

    Capybara.within_frame(messenger_iframe){
      page.has_content?("a few seconds ago")
    }

  end


end
