require "rails_helper"
require "sidekiq/testing"

RSpec.describe "Widget management", type: :system do
  let!(:app) do
    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  let!(:user) do
    app.add_user({ email: "test@test.cl" })
  end

  let!(:agent_role) do
    app.add_agent({ email: "test2@test.cl", name: "test agent", first_name: "test", last_name: "agent" })
  end

  let(:assignment_rule) do
    lambda { |rules|
      app.assignment_rules.create({
                                    title: "test",
                                    agent: agent_role.agent,
                                    conditions: rules || [],
                                    priority: 1
                                  })
    }
  end

  let(:user_auto_message) do
    FactoryBot.create(:user_auto_message, app: app)
  end

  def serialized_content(content = "foobar")
    {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: content }] }]
    }.to_json
  end

  def setting_for_user(
    enabled: false,
    users: true,
    user_segment: "all",
    user_options: [],
    visitors: true,
    visitor_options: [],
    visitor_segment: "all"
  )
    settings = {
      "enabled" => enabled,
      "users" => { "enabled" => users, "segment" => user_segment, "predicates" => user_options },
      "visitors" => { "enabled" => visitors, "segment" => visitor_segment, "predicates" => visitor_options }
    }
    app.update(inbound_settings: settings)
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Rails.application.config.active_job.queue_adapter = :test
  end

  describe "translations" do
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
      ClientTesterController.any_instance.stub(:user_options) do
        { email: "test@test.cl",
          identifier_key: OpenSSL::HMAC.hexdigest("sha256", app.encryption_key, "test@test.cl"),
          properties: {
            name: "miguel",
            lang: "en",
            id: "localhost",
            country: "chile",
            role: "admin",
            pro: true
          } }
      end

      open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
        expect(page).to have_content(app.greetings_en)
        expect(page).to have_content(app.intro_en)
      end
    end

    it "spanish will render spanish greeting" do
      ClientTesterController.any_instance.stub(:user_options) do
        { email: "test@test.cl",
          identifier_key: OpenSSL::HMAC.hexdigest("sha256", app.encryption_key, "test@test.cl"),
          properties: {
            name: "miguel",
            lang: "es",
            id: "localhost",
            country: "chile",
            role: "admin",
            pro: true
          } }
      end

      open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
        expect(page).to have_content(app.greetings_es)
        expect(page).to have_content(app.intro_es)
      end
    end

    it "english sessionless default" do
      ClientTesterController.any_instance.stub(:configured_lang) { "en" }

      open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
        expect(page).to have_content(app.greetings_en)
        expect(page).to have_content(app.intro_en)
      end
    end

    it "spanish sessionless" do
      ClientTesterController.any_instance.stub(:configured_lang) { "es" }

      open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
        expect(page).to have_content(app.greetings_es)
        expect(page).to have_content(app.intro_es)
      end
    end
  end

  describe "anonimous user" do
    ## OKOK
    it "renders messenger on anonimous user creating a app user" do
      open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
        expect(page).to have_content("Start a conversation")
      end

      user = app.app_users.last

      expect(app.app_users.count).to be == 2
      expect(user.properties).to_not be_blank
      expect(user.last_visited_at).to_not be_blank
      # expect(user.referrer).to_not be_blank
      # expect(user.lat).to_not be_blank
      # expect(user.lng).to_not be_blank
      # expect(user.os).to_not be_blank
      # expect(user.os_version).to_not be_blank
      # expect(user.browser).to_not be_blank
      # expect(user.browser_version).to_not be_blank
      # expect(user.browser_language).to_not be_blank

      # visit "/tester/#{app.key}"
      # expect(app.app_users.count).to be == 1

      app.start_conversation({
                               message: {
                                 serialized_content: serialized_content
                               },
                               from: user
                             })
    end
  end

  describe "inbound settings" do
    it "return for user user" do
      user_options = [{ attribute: "email", comparison: "contains", type: "string", value: "test" }]
      setting_for_user(user_segment: "some", user_options: user_options)
      expect(app.query_segment("users")).to be_any
      visit "/tester/#{app.key}"
      expect(page).to have_css("#chaskiq-prime")

      # open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      #  expect(page).to have_css("#chaskiq-prime")
      # end

      # open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      #  expect(page).to have_content("Start a conversation")
      # end
    end

    it "no return for user" do
      user_options = [{ attribute: "email", comparison: "not_contains", type: "string", value: "test" }]
      setting_for_user(user_segment: "some", user_options: user_options)
      expect(app.query_segment("users")).to_not be_any
      visit "/tester/#{app.key}"
      expect(page).to_not have_css("#chaskiq-prime")
      # prime_iframe = all("iframe").first
      # expect(prime_iframe).to be_blank
    end

    it "return for user visitor" do
      visitor_options = [{ attribute: "name", comparison: "contains", type: "string", value: "isito" }]
      setting_for_user(enabled: true, visitor_segment: "some", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"

      # expect(app.query_segment("visitors")).to be_any
      expect(page).to have_css("#chaskiq-prime")
      # prime_iframe = all("iframe").first
      # Capybara.within_frame(prime_iframe) do
      #  expect(page).to have_css("#chaskiq-prime")
      # end
    end

    it "no return for visitor on some segment" do
      visitor_options = [{ attribute: "email", comparison: "not_contains", type: "string", value: "test" }]
      setting_for_user(visitor_segment: "some", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"

      expect(app.query_segment("visitors")).to_not be_any
      expect(page).to_not have_css("#chaskiq-prime")
      # prime_iframe = all("iframe").first
      # expect(prime_iframe).to be_blank
    end

    it "no return for visitor on disabled" do
      visitor_options = [{ attribute: "email", comparison: "not_contains", type: "string", value: "test" }]
      setting_for_user(visitor_segment: "some", visitors: false, visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"
      expect(app.query_segment("visitors")).to_not be_any
      expect(page).to_not have_css("#chaskiq-prime")
      # prime_iframe = all("iframe").first
      # expect(prime_iframe).to be_blank
    end

    it "return for visitor segment all" do
      visitor_options = []
      setting_for_user(visitor_segment: "all", visitor_options: visitor_options)
      visit "/tester/#{app.key}?sessionless=true"
      expect(page).to have_css("#chaskiq-prime")
      # open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      #  expect(page).to have_css("#chaskiq-prime")
      # end
    end
  end

  it "blocked user will not display" do
    user_options = []
    setting_for_user(user_segment: "some", user_options: user_options)
    expect(app.query_segment("users")).to be_any
    visit "/tester/#{app.key}"

    expect(page).to have_selector("#chaskiq-prime")

    app.app_users.first.block!
    visit "/tester/#{app.key}"

    expect(page).to_not have_selector("iframe")
  end

  it "run previous conversations" do
    app.start_conversation({
                             message: {
                               serialized_content: serialized_content
                             },
                             from: user
                           })

    open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
      page.click_link("See previous")

      # expect(page).to have_content(user.email)
      expect(page).to have_content("a few seconds ago")

      find("#conversations-list a").click
      expect(page).to have_content("foobar")
      page.find("textarea").set("oeoe \n")
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
    end
  end

  it "start conversation" do
    open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
      page.click_link("Start a conversation")

      # expect(page).to have_content(user.email)
      # expect(page).to have_content("a few seconds ago")
      #
      # page.find(:xpath, "/html/body/div/div/div/div[2]/div/div/div[1]/div").click
      # expect(page).to have_content("foobar")
      page.find("textarea").set("oeoe \n")
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
      # expect(page).to have_content("test agent")
    end
  end

  describe "user auto messages" do
    let! :message do
      message = FactoryBot.create(:user_auto_message,
                                  app: app,
                                  segments: nil, # app.segments.first.predicates,
                                  scheduled_at: 2.days.ago,
                                  scheduled_to: 30.days.from_now,
                                  serialized_content: serialized_content("First Message"),
                                  settings: { "hidden_constraints" => ["open"] })

      message.enable!
    end

    it "receive message will track open" do
      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 1

      # on a second visit the message will dissapear

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 0
    end

    it "dismiss message" do
      message = FactoryBot.create(:user_auto_message,
                                  app: app,
                                  segments: nil, # app.segments.first.predicates,
                                  scheduled_at: 2.days.ago,
                                  scheduled_to: 30.days.from_now,
                                  serialized_content: serialized_content("Second Message"),
                                  settings: { "hidden_constraints" => ["close"] })

      message.enable!

      visit "/tester/#{app.key}"

      Capybara.within_frame(all("iframe").first) do
        expect(page).to have_content("First Message")
        expect(page).to have_content("Second Message")
      end

      expect(all("iframe").size).to be == 1

      # on a second visit the message will dissapear
      visit "/tester/#{app.key}"

      expect(all("iframe").size).to be == 1

      Capybara.within_frame(all("iframe").first) do
        expect(page).to_not have_content("First Message")
        expect(page).to have_content("Second Message")
        page.click_button("dismiss")
      end

      visit "/tester/#{app.key}"

      sleep(2)

      expect(all("iframe").size).to be == 0
    end
  end

  describe "tours" do
    let(:host_port) do
      "#{Capybara.current_session.server.host}:#{Capybara.current_session.server.port}"
    end

    let(:tour) do
      tour_attributes = {
        "app" => app,
        "key" => nil,
        "from_name" => nil,
        "from_email" => nil,
        "reply_email" => nil,
        "html_content" => nil,
        "premailer" => nil,
        "serialized_content" => nil,
        "description" => "oli",
        "sent" => nil,
        "name" => "ooioij",
        "scheduled_at" => 2.days.ago,
        "scheduled_to" => 2.days.from_now,
        "timezone" => nil,
        "state" => "disabled",
        "subject" => "oijoij",
        "segments" => [{ "type" => "match", "value" => "and", "attribute" => "match", "comparison" => "and" }],
        "type" => "Tour",
        "settings" => { "url" => "/tester/#{app.key}",
                        "steps" => [
                          { "target" => "H1", "serialized_content" => serialized_content("this is the tour") },
                          { "target" => "H1", "serialized_content" => serialized_content("final tour step") }
                        ],
                        "hidden_constraints" => %w[skip finish] }
      }
      app.tours.create(tour_attributes)
    end

    let(:tour_with_other_url) do
      tour_attributes = {
        "app" => app,
        "key" => nil,
        "from_name" => nil,
        "from_email" => nil,
        "reply_email" => nil,
        "html_content" => nil,
        "premailer" => nil,
        "serialized_content" => nil,
        "description" => "oli",
        "sent" => nil,
        "name" => "ooioij",
        "scheduled_at" => 2.days.ago,
        "scheduled_to" => 2.days.from_now,
        "timezone" => nil,
        "state" => "disabled",
        "subject" => "oijoij",
        "segments" => [{ "type" => "match", "value" => "and", "attribute" => "match", "comparison" => "and" }],
        "type" => "Tour",
        "settings" => { "url" => "#{host_port}/tester/#{app.key}/alala",
                        "steps" => [
                          { "target" => "H1", "serialized_content" => serialized_content("this is the tour") },
                          { "target" => "H1", "serialized_content" => serialized_content("final tour step") }
                        ],
                        "hidden_constraints" => %w[skip finish] }
      }
      app.tours.create(tour_attributes)
    end

    it "display tour, track open" do
      tour.enable!
      visit "/tester/#{app.key}"
      sleep(2)
      expect(tour.metrics.where(app_user: AppUser.last, action: "open")).to be_any
    end

    it "display tour, finish event" do
      tour.enable!
      visit "/tester/#{app.key}"
      expect(page).to have_content("this is the tour")
      page.find(".driver-popover-next-btn").click
      expect(page).to have_content("final tour step")
      page.click_button("Done")
      expect(page).not_to have_content("final tour step")
      visit "/tester/#{app.key}"
      expect(page).not_to have_content("this is the tour")
    end

    it "display tour, skip event" do
      tour.enable!
      visit "/tester/#{app.key}"

      expect(page).to have_content("this is the tour")

      page.find(".driver-popover-close-btn").click

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
                   { day: "tue", from: "01:00", to: "01:30" }
                 ])

      open_new_messenger({ params: { lang: "es" } }, sessionless: true) do |page|
        expect(page).to have_content("volvemos la proxima semana")
      end
    end
  end

  describe "bot default settings" do
    context "sessionless" do
      it "shows reply time" do
        # Sidekiq::Testing.inline! do

        app.update(
          timezone: "UTC",
          lead_tasks_settings: {
            delay: false,
            routing: "assign",
            email_requirement: "email_only",
            assignee: agent_role.agent,
            share_typical_time: true
          },
          team_schedule: [
            { day: "tue", from: "01:00", to: "01:30" }
          ]
        )

        open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
          page.click_link("Start a conversation")
          page.find("textarea").set("oeoe \n")
          expect(page).to have_content("oeoe")
          expect(page).to have_content("will reply as soon as they can.")
        end

        # end
      end

      it "shows email requirement" do
        Sidekiq::Testing.inline!

        app.update(
          timezone: "UTC",
          lead_tasks_settings: {
            delay: false,
            routing: "assign",
            email_requirement: "email_only",
            assignee: agent_role.agent.id,
            share_typical_time: true
          },
          email_requirement: "Always",
          team_schedule: [
            { day: "tue", from: "01:00", to: "01:30" }
          ]
        )

        # Add the 'Qualifier' package or similar setup
        add_app_package("Qualifier")

        open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
          page.click_link("Start a conversation")
          page.find("textarea").set("oeoe \n")
          expect(page).to have_content("oeoe")

          expect(page).to have_content("Are you an existing my app customer?")

          page.click_button("Yes, I'm a customer")
          expect(page).to have_content("GET NOTIFIED BY EMAIL")
          fill_in("email", with: "John@apple.cl")
          page.find("button#email").click

          expect(page).to have_content("Thank you")
        end
      end

      it "not shows email requirement" do
        Sidekiq::Testing.inline!

        app.update(
          timezone: "UTC",
          lead_tasks_settings: {
            delay: false,
            routing: "assign",
            email_requirement: "email_only",
            assignee: agent_role.agent,
            share_typical_time: true
          },
          email_requirement: "never",
          team_schedule: [
            { day: "tue", from: "01:00", to: "01:30" }
          ]
        )

        open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
          page.click_link("Start a conversation")
          expect(page).to_not have_content("enter your email")
        end
      end
    end
  end
end
