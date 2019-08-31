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
    app.add_agent({email: "test2@test.cl", name: "test agent"})
  }

  let(:assignment_rule){

    ->(rules) {
      app.assignment_rules.create({
        title: "test", 
        agent: agent_role.agent, 
        conditions: rules || [], 
        priority: 1 
      })
    }
  }

  let(:user_auto_message){ 
    FactoryGirl.create(:user_auto_message, app: app)
  }

  def serialized_content(text="foobar")
    "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
  end

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

  context "anonimous user" do

    it "renders messenger on anonimous user creating a app user" do                       
      visit "/tester/#{app.key}?sessionless=true"

      prime_iframe = all("iframe").first

      Capybara.within_frame(prime_iframe){ 
        page.find("#chaskiq-prime").click 
      }

      sleep(3)

      # now 2nd iframe appears on top
      messenger_iframe = all("iframe").first

      Capybara.within_frame(messenger_iframe){ 
        #page.has_content?("Hello") 
        expect(page).to have_content("Hello")
      }

      user = app.app_users.last
    
      expect(app.app_users.count).to be == 2
      expect(user.properties).to_not be_blank
      expect(user.last_visited_at).to_not be_blank
      #expect(user.referrer).to_not be_blank
      #expect(user.lat).to_not be_blank
      #expect(user.lng).to_not be_blank
      #expect(user.os).to_not be_blank
      #expect(user.os_version).to_not be_blank
      #expect(user.browser).to_not be_blank
      #expect(user.browser_version).to_not be_blank
      #expect(user.browser_language).to_not be_blank

      #visit "/tester/#{app.key}"
      #expect(app.app_users.count).to be == 1

      app.start_conversation({
        message: {
          serialized_content: serialized_content
        }, 
        from: user
      })
      

    end


  end


  it "run previous conversations" do                       
    
    app.start_conversation({
      message: {
        serialized_content: serialized_content
      }, 
      from: user
    })

    visit "/tester/#{app.key}"

    prime_iframe = all("iframe").first

    Capybara.within_frame(prime_iframe){ 
      page.find("#chaskiq-prime").click 
    }

    sleep(2)
    # now 2nd iframe appears on top
    messenger_iframe = all("iframe").first

    Capybara.within_frame(messenger_iframe){
      page.click_link("see previous")
      expect(page).to have_content(user.email)
      expect(page).to have_content("a few seconds ago")
      
      page.find(:xpath, "/html/body/div/div/div/div[2]/div/div/div[1]/div").click
      expect(page).to have_content("foobar")
      page.find(:xpath, "/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea").set("oeoe \n")
      expect(page).to have_content("oeoe")
      

      app.conversations.first.add_message({
        from: app.agents.first,
        message: {
          html_content: "<p>ss</p>",
          serialized_content: serialized_content("1111111"),
          text_content: serialized_content("1111111")
        }
      })

      expect(page).to have_content("1111111")

    }

  end


  it "start conversation" do                       
    
    visit "/tester/#{app.key}"

    prime_iframe = all("iframe").first

    # will assign someone
    assignment_rule[[]]

    Capybara.within_frame(prime_iframe){ 
      page.find("#chaskiq-prime").click 
    }

    sleep(2)
    # now 2nd iframe appears on top
    messenger_iframe = all("iframe").first

    Capybara.within_frame(messenger_iframe){
      
      page.click_link("start conversation")
      
      #expect(page).to have_content(user.email)
      #expect(page).to have_content("a few seconds ago")
      #
      #page.find(:xpath, "/html/body/div/div/div/div[2]/div/div/div[1]/div").click
      #expect(page).to have_content("foobar")
      page.find(:xpath, "/html/body/div/div/div/div[2]/div/div/div/div[2]/div/div/textarea").set("oeoe \n")
      expect(page).to have_content("oeoe")
      #

      app.conversations.first.add_message({
        from: app.agents.first,
        message: {
          html_content: "<p>ss</p>",
          serialized_content: serialized_content("1111111"),
          text_content: serialized_content("1111111")
        }
      })

      expect(page).to have_content("1111111")
      expect(page).to have_content("test agent")

    }

  end


  describe "user auto messages" do

    before :each do
      message = FactoryGirl.create(:user_auto_message, 
        app: app, 
        segments: nil, #app.segments.first.predicates,
        scheduled_at: 2.day.ago,
        scheduled_to: 30.days.from_now,
        settings: {"hidden_constraints"=>["open"]}
      )

      message.enable!
    end

    it "receive message will track open" do

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 2

      # on a second visit the message will dissapear

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 1

    end

    it "receive message will track open" do

      message = FactoryGirl.create(:user_auto_message, 
        app: app, 
        segments: nil, #app.segments.first.predicates,
        scheduled_at: 2.day.ago,
        scheduled_to: 30.days.from_now,
        settings: {"hidden_constraints"=>["close"]}
      )

      message.enable!

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 2

      # on a second visit the message will dissapear

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 2

      Capybara.within_frame(all("iframe").first){ 
        page.click_link("dismiss")
      }

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 1

    end

  end


  describe "tours" do
    
    let!(:tour) do
      tour_attributes = {
        "app"=> app,
        "key"=>nil, 
        "from_name"=>nil, 
        "from_email"=>nil, 
        "reply_email"=>nil, 
        "html_content"=>nil, 
        "premailer"=>nil, 
        "serialized_content"=>nil, 
        "description"=>"oli", 
        "sent"=>nil, 
        "name"=>"ooioij", 
        "scheduled_at"=>2.day.ago, 
        "scheduled_to"=>2.day.from_now, 
        "timezone"=>nil, 
        "state"=>"disabled", 
        "subject"=>"oijoij", 
        "segments"=>[{"type"=>"match", "value"=>"and", "attribute"=>"match", "comparison"=>"and"}], 
        "type"=>"Tour", 
        "settings"=>{"url"=>"http://127.0.0.1:62064/tester/#{app.key}", 
        "steps"=>[
          {"target"=>"H1", "serialized_content"=>"{\"blocks\":[{\"key\":\"f1qmb\",\"text\":\"this is the tour\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"}, 
          {"target"=>"H2:nth-child(3)", "serialized_content"=>"{\"blocks\":[{\"key\":\"f1qmb\",\"text\":\"final tour step\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"}
          ], 
        "hidden_constraints"=>["skip", "finish"]
        },
      }
      app.tours.create(tour_attributes)
    end

    it "display tour, track open" do
      tour.enable!
      visit "/tester/#{app.key}"
      sleep(5)
      expect(tour.metrics.where(trackable: AppUser.last, action: "open")).to be_any
    end


    it "display tour, finish event" do
      tour.enable!
      visit "/tester/#{app.key}"
      expect(page).to have_content("this is the tour")  
      page.click_button("Next (1/2)")
      expect(page).to have_content("final tour step") 
      sleep(5)
      page.click_button("Last (2/2)")
      expect(page).not_to have_content("final tour step") 
      visit "/tester/#{app.key}"
      expect(page).not_to have_content("this is the tour")
    end

    it "display tour, skip event" do
      tour.enable!
      visit "/tester/#{app.key}"
 
      expect(page).to have_content("this is the tour") 
      
      sleep(5)

      page.click_button("skip")

      sleep(5)

      expect(page).not_to have_content("final tour step")

      visit "/tester/#{app.key}"
      
      expect(page).not_to have_content("this is the tour")
    end

  end
  


end
