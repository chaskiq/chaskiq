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

  def setting_for_user(enabled: false, 
    users: true, 
    user_segment: "all", 
    user_options: [],
    visitors: true, 
    visitor_options: [],
    visitor_segment: "all"
  )
    settings = {  
      "enabled"=>enabled,
      "users"=>{"enabled"=>users, "segment"=>user_segment, "predicates"=>user_options },
      "visitors"=>{"enabled"=>visitors, "segment"=>visitor_segment, "predicates"=>visitor_options }
    }
    app.update(inbound_settings: settings)
  end

  before do

    if ENV["CI"].present? 
      #Selenium::WebDriver::Chrome::Service.driver_path = ENV.fetch('GOOGLE_CHROME_BIN', nil)
      #options = Selenium::WebDriver::Chrome::Options.new
      #options.binary = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
      #driver = Selenium::WebDriver.for :chrome, options: options
      Capybara.register_driver :chrome do |app|
        options = Selenium::WebDriver::Chrome::Options.new(args: %w[no-sandbox headless disable-gpu])
        Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
      end
    end

    options_for_selemium = ENV["CI"].present? ? 

    {
      args: %w[no-sandbox headless disable-gpu] ,
    } : {}

    driven_by :selenium, using: :chrome, screen_size: [1400, 1400],
     options: options_for_selemium
  end

  context "translations" do
    before :each do
      app.update({
        greetings_es: "Hola amigo", 
        greetings_en: "hello friend",

        intro_en: "we are here to help",
        tagline_en: "estamos aqui para ayudarte",

        intro_es: "somos un equipo genial",
        tagline_es: "we are an awesome team"
      })
    end


    it "english default" do

      ClientTesterController.any_instance.stub(:user_options){
        { email: "test@test.cl",
          properties: {
              name: "miguel",
              lang: "en",
              id: "localhost",
              country: "chile",
              role: "admin",
              pro: true
          }
        } 
      }
      
      visit "/tester/#{app.key}"

      Capybara.within_frame(all("iframe").first){ 
        page.find("#chaskiq-prime").click 
      }

      sleep(3)

      # now 2nd iframe appears on top
      Capybara.within_frame(all("iframe").first){ 
        expect(page).to have_content(app.greetings_en)
        expect(page).to have_content(app.intro_en)
      }
    end


    it "spanish will render spanish greeting" do

      ClientTesterController.any_instance.stub(:user_options){
        { email: "test@test.cl",
          properties: {
              name: "miguel",
              lang: "es",
              id: "localhost",
              country: "chile",
              role: "admin",
              pro: true
          }
        } 
      }

      visit "/tester/#{app.key}"

      Capybara.within_frame(all("iframe").first){ 
        page.find("#chaskiq-prime").click 
      }

      sleep(3)

      # now 2nd iframe appears on top
      Capybara.within_frame(all("iframe").first){ 
        expect(page).to have_content(app.greetings_es)
        expect(page).to have_content(app.intro_es)
      }
    end


    it "english sessionless default" do

      ClientTesterController.any_instance.stub(:configured_lang) { 'en' }

      visit "/tester/#{app.key}?sessionless=true"

      Capybara.within_frame(all("iframe").first){ 
        page.find("#chaskiq-prime").click 
      }

      sleep(3)

      # now 2nd iframe appears on top
      Capybara.within_frame(all("iframe").first){ 
        expect(page).to have_content(app.greetings_en)
        expect(page).to have_content(app.intro_en)
      }
    end

    it "spanish sessionless" do

      ClientTesterController.any_instance.stub(:configured_lang) { 'es' }

      visit "/tester/#{app.key}?sessionless=true"

      Capybara.within_frame(all("iframe").first){ 
        page.find("#chaskiq-prime").click 
      }

      sleep(3)

      # now 2nd iframe appears on top
      Capybara.within_frame(all("iframe").first){ 
        expect(page).to have_content(app.greetings_es)
        expect(page).to have_content(app.intro_es)
      }

      
    end

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
        expect(page).to have_content("Start a conversation")
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

  context "inbound settings" do

    it "return for user user" do
      user_options = [{"attribute":"email","comparison":"contains","type":"string","value":"test"}]
      setting_for_user(user_segment: "some", user_options: user_options)
      expect(app.query_segment("users")).to be_any
      visit "/tester/#{app.key}"
      prime_iframe = all("iframe").first
      Capybara.within_frame(prime_iframe){ 
        expect(page).to have_css("#chaskiq-prime")
      }   
    end

    it "no return for user" do
      user_options = [{"attribute":"email","comparison":"not_contains","type":"string","value":"test"}]
      setting_for_user(user_segment: "some", user_options: user_options)
      expect(app.query_segment("users")).to_not be_any
      visit "/tester/#{app.key}"
      prime_iframe = all("iframe").first
      expect(prime_iframe).to be_blank 
    end


    it "return for user visitor" do
      visitor_options = [{"attribute":"name","comparison":"contains","type":"string","value":"isito"}]
      setting_for_user(visitor_segment: "some", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"      
      expect(app.query_segment("visitors")).to be_any
      prime_iframe = all("iframe").first
      Capybara.within_frame(prime_iframe){ 
        expect(page).to have_css("#chaskiq-prime")
      }   
    end

    it "no return for visitor on some segment" do
      visitor_options = [{"attribute":"email","comparison":"not_contains","type":"string","value":"test"}]
      setting_for_user(visitor_segment: "some", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"
      expect(app.query_segment("visitors")).to_not be_any
      prime_iframe = all("iframe").first
      expect(prime_iframe).to be_blank 
    end

    it "no return for visitor on disabled" do
      visitor_options = [{"attribute":"email","comparison":"not_contains","type":"string","value":"test"}]
      setting_for_user(visitor_segment: "some", visitors: false, visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"
      expect(app.query_segment("visitors")).to_not be_any
      prime_iframe = all("iframe").first
      expect(prime_iframe).to be_blank 
    end

    it "return for visitor segment all" do
      visitor_options = []
      setting_for_user(visitor_segment: "all", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"
      prime_iframe = all("iframe").first
      Capybara.within_frame(prime_iframe){ 
        expect(page).to have_css("#chaskiq-prime")
      } 
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

    it "dismiss message" do

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

    let(:host_port){
      "#{Capybara.current_session.server.host}:#{Capybara.current_session.server.port}"
    }
    
    let(:tour) do
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
        "settings"=>{"url"=>"/tester/#{app.key}", 
        "steps"=>[
          {"target"=>"H1", "serialized_content"=>"{\"blocks\":[{\"key\":\"f1qmb\",\"text\":\"this is the tour\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"}, 
          {"target"=>"H2:nth-child(3)", "serialized_content"=>"{\"blocks\":[{\"key\":\"f1qmb\",\"text\":\"final tour step\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"}
          ], 
        "hidden_constraints"=>["skip", "finish"]
        },
      }
      app.tours.create(tour_attributes)
    end

    let(:tour_with_other_url) do
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
        "settings"=>{"url"=>"#{host_port}/tester/#{app.key}/alala", 
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

    it "display on configured url" do
      tour.enable!
      visit "/tester/#{app.key}/another"
      sleep(5)
      expect(page).to_not have_content("this is the tour")

      visit "/tester/#{app.key}"
      sleep(5)
      expect(page).to have_content("this is the tour")
    end

  end

  describe "availability" do

    before :each do

    end

    it "next week" do
      app.update(timezone: "UTC", team_schedule: [
        { day: "tue", from: "01:00" , to: '01:30' },
      ])

      visit "/tester/#{app.key}"

      Capybara.within_frame(all("iframe").first){ 
        page.find("#chaskiq-prime").click 
      }
      
      sleep(3)

      Capybara.within_frame(all("iframe").first){ 
        expect(page).to have_content("volvemos la proxima semana")
      }
    end



  end


  describe "bot default settings" do

    context "sessionless" do

      it "shows reply time" do

        app.update(
          timezone: "UTC", 
          lead_tasks_settings: {
            delay: true, 
            routing: "assign", 
            email_requirement: "email_only", 
            assignee: agent_role.agent, 
            share_typical_time: true
          },
          team_schedule: [
          { day: "tue", from: "01:00" , to: '01:30' },
        ])

        visit "/tester/#{app.key}?sessionless=true"

        prime_iframe = all("iframe").first

        Capybara.within_frame(prime_iframe){ 
          page.find("#chaskiq-prime").click 
        }
    
        sleep(2)
        # now 2nd iframe appears on top
        messenger_iframe = all("iframe").first
    
        Capybara.within_frame(messenger_iframe){ 
          page.click_link("start conversation")
          expect(page).to have_content("will reply as soon as they can.")
        }

      end


      it "shows email requirement" do

        app.update(
          timezone: "UTC", 
          lead_tasks_settings: {
            delay: true, 
            routing: "assign", 
            email_requirement: "email_only", 
            assignee: agent_role.agent, 
            share_typical_time: true
          },
          email_requirement: "Always",
          team_schedule: [
          { day: "tue", from: "01:00" , to: '01:30' },
        ])

        visit "/tester/#{app.key}?sessionless=true"

        prime_iframe = all("iframe").first

        Capybara.within_frame(prime_iframe){ 
          page.find("#chaskiq-prime").click 
        }
    
        sleep(2)
        # now 2nd iframe appears on top
        messenger_iframe = all("iframe").first
    
        Capybara.within_frame(messenger_iframe){ 
          page.click_link("start conversation")
          expect(page).to have_content("enter your email")
        }
      end


    end

  end
  


end
