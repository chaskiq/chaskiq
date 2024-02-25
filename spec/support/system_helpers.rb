module FeatureHelpers
  def login
    visit "/"
    fill_in "agent_email", with: "miguelmichelson@gmail.com"
    fill_in "agent_password", with: "123456"
    click_button "Connect"
  end

  def auth0_login
    visit "/"

    click_button "Connect Auth0"
    expect(page.current_url).to include("https://auth.gocience.com/u/organization")

    fill_in "organizationName", with: "cience-development"
    click_on "Continue"

    expect(page.current_url).to include("https://auth.gocience.com/u/login")

    fill_in "username", with: Chaskiq::Config.get("TEST_USER_EMAIL")
    fill_in "password", with: Chaskiq::Config.get("TEST_USER_PASSWORD")
    click_button "Continue"

    expect(page.current_url).to include("localhost:5002/apps/")
    expect(page).to have_content "WELCOME BACK TO CIENCE DEVELOPMENT"
  end

  def open_new_messenger(options = {}, sessionless: false)
    app_key = app.key
    url_params = options[:params] || {}
    url_params = url_params.merge(sessionless: sessionless) if sessionless

    visit "/tester/#{app_key}?#{url_params.to_query}"
    sleep(2) # Wait for page load, replace with appropriate Capybara wait methods
    find("#chaskiq-prime").click if options[:disable_open].blank?
    within_frame(find("iframe")) do
      yield(page)
    end
  end

  def start_conversation_from_agent
    text = "foobar"
    serialized_content = MessageApis::BlockManager.serialized_text(text)
    # "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
    app.start_conversation(
      message: {
        serialized_content: serialized_content,
        html_content: text
      },
      from: agent,
      participant: app.app_users.last
    )
  end

  def add_app_package(app_package)
    # require 'app_packages_catalog'
    # AppPackagesCatalog.update_all(dev_packages: true)
    Plugin.restore_plugins_from_fs

    app_package = AppPackage.find_by(name: app_package)
    integration = app.app_package_integrations.new
    integration.app_package = app_package
    integration.save
  end

  def add_home_app(namespace, definitions)
    app.update(namespace => definitions)
  end

  def add_app_package_to_home(namespace, params)
    integration = app.app_package_integrations.first
    integration

    app.update(
      namespace => [params]
    )
  end

  def translations
    app.update({
                 greetings_es: "Hola amigo",
                 greetings_en: "hello friend",

                 intro_en: "we are here to help",
                 intro_es: "somos un equipo genial",

                 tagline_es: "estamos aqui para ayudarte",
                 tagline_en: "we are an awesome team"
               })
  end

  def bot_task_command(app_key)
    default_predicates = [
      {
        type: "match",
        value: "and",
        attribute: "match",
        comparison: "and"
      }
    ]

    attributes = {
      "title" => "oother",
      "state" => "enabled",
      "segments" => [
        { "type" => "match", "value" => "and", "attribute" => "match", "comparison" => "and" },
        { "type" => "string", "value" => %w[Visitor Lead], "attribute" => "type", "comparison" => "in" }
      ],
      "app_id" => app.id,
      # "settings"=>{},
      "paths" => [
        { "id" => "a7ca74ba-91a1-490d-9ee4-4f003f8346c3", "steps" => [{ "step_uid" => "821370d6-ab07-4639-88e0-9189812dc7c0", "type" => "messages", "messages" => [{ "app_user" => { "display_name" => "bot", "email" => "bot@chasqik.com", "id" => 1, "kind" => "agent" },
                                                                                                                                                                     "serialized_content" => MessageApis::BlockManager.serialized_text("one"),
                                                                                                                                                                     # '{"blocks":[{"key":"9oe8n","text":"one","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                                                                                                                                                                     "html_content" => "--***--" }] },
                                                                      { "step_uid" => "e4e824a5-a044-4470-ae2a-6f4c6873688b", "type" => "messages", "messages" => [{ "app_user" => { "display_name" => "bot", "email" => "bot@chasqik.com", "id" => 1, "kind" => "agent" },
                                                                                                                                                                     "serialized_content" => MessageApis::BlockManager.serialized_text("two"),
                                                                                                                                                                     # '{"blocks":[{"key":"9oe8n","text":"two","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                                                                                                                                                                     "html_content" => "--***--" }] },
                                                                      { "step_uid" => "65b23057-fd01-41be-a6a6-ad1dad124560", "type" => "messages", "messages" => [{ "app_user" => { "display_name" => "bot", "email" => "bot@chasqik.com", "id" => 1, "kind" => "agent" },
                                                                                                                                                                     "serialized_content" => MessageApis::BlockManager.serialized_text("tree"),
                                                                                                                                                                     # '{"blocks":[{"key":"9oe8n","text":"tree","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                                                                                                                                                                     "html_content" => "--***--" }] },
                                                                      { "step_uid" => "f6aa3e6e-6279-49a2-8234-2953d4f977a9", "type" => "messages", "messages" => [], "controls" => { "type" => "wait_for_reply", "schema" => [] } },
                                                                      { "step_uid" => "aed55b6e-de26-413f-8fc9-975f8c62a4e7", "type" => "messages", "messages" => [{ "app_user" => { "display_name" => "bot", "email" => "bot@chasqik.com", "id" => 1, "kind" => "agent" },
                                                                                                                                                                     "serialized_content" => MessageApis::BlockManager.serialized_text("four"),
                                                                                                                                                                     # '{"blocks":[{"key":"9oe8n","text":"four","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                                                                                                                                                                     "html_content" => "--***--" }] }],
          "title" => "oijioj", "follow_actions" => nil }
      ],
      "bot_type" => "outbound"
      # "position"=>3
    }

    app.bot_tasks.create(attributes)
  end

  def app_bot_settings(options)
    # frozen_string_literal: true

    Geocoder::Lookup::Test.set_default_stub(
      [
        {
          "coordinates" => [40.7143528, -74.0059731],
          "latitude" => 40.7143528,
          "longitude" => -74.0059731,
          "address" => "New York, NY, USA",
          "state" => "New York",
          "city" => "newy york",
          "region" => "new_yorke",
          "state_code" => "NY",
          "country" => "United States",
          "country_code" => "US"
        }
      ]
    )

    # app = FactoryBot.create(:app,
    #                        domain_url: "http://localhost:5002",
    #                        encryption_key: "unodostrescuatro",
    #                        active_messenger: "true",
    #                        state: "enabled")

    agent = app.add_agent({ email: "test@test.cl", name: "sharleena" })
    # user = app.add_user({email: "test@test.cl"})

    app.update(
      timezone: "UTC",
      lead_tasks_settings: {
        delay: false,
        routing: "assign",
        email_requirement: "email_only",
        assignee: agent.agent.id,
        share_typical_time: true
      },
      email_requirement: options["email_requirement"],
      team_schedule: [
        { day: "tue", from: "01:00", to: "01:30" }
      ]
    )
  end

  def start_conversation_command(command_options)
    ActiveRecord::Base.connection_pool.with_connection do
      text = command_options.fetch(:text) || "aaa"
      serialized_content = MessageApis::BlockManager.serialized_text(text)
      # "{\"blocks\": [{\"key\":\"bl82q\",\"text\":\"#{text}\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
      app = App.find_by(key: command_options.fetch(:app_key))

      app.assignment_rules.create(
        title: "test",
        agent: app.agents.first,
        conditions: command_options.fetch(:rules) || [],
        priority: 1
      )

      app.conversations.first.add_message(
        from: app.agents.first,
        message: {
          html_content: "<p>ss</p>",
          serialized_content: serialized_content,
          text_content: serialized_content
        }
      )
    end
  end

  def new_conversation_bot_task_command(command_options)
    default_predicates = [
      {
        type: "match",
        value: "and",
        attribute: "match",
        comparison: "and"
      }
    ]

    attributes = {
      "title" => "oother",
      "state" => "enabled",
      "segments" => [
        { "type" => "string", "value" => "AppUser", "attribute" => "type", "comparison" => "eq" }
      ],
      "app_id" => 1,
      "paths" => [
        {
          "id" => "3418f148-6c67-4789-b7ae-8fb3758a4cf9",
          "steps" => [
            {
              "type" => "messages",
              "controls" => {
                "type" => "ask_option",
                "label" => "migujhijoij",
                "schema" => [
                  {
                    "id" => "0dc3559e-4eab-43d9-ab60-7325219a3f6f",
                    "label" => "see more?",
                    "element" => "button",
                    "next_step_uuid" => "73a9d3ec-05f2-4bc9-8fcc-89c51787bb3f"
                  },
                  {
                    "type" => "messages",
                    "controls" => {
                      "type" => "ask_option",
                      "schema" => [
                        {
                          "id" => "0dc3559e-4eab-43d9-ab60-7325219a3f6f",
                          "label" => "write here",
                          "element" => "button"
                        }
                      ]
                    },
                    "messages" => [],
                    "step_uid" => "30e48aed-19c0-4b62-8afa-9a0392deb0b8"
                  }
                ],
                "wait_for_input" => true
              },
              "messages" => [],
              "step_uid" => "30e48aed-19c0-4b62-8afa-9a0392deb0b8"
            }
          ],
          "title" => "uno",
          "follow_actions" => nil
        },
        {
          "id" => "00e9e01a-5af2-4209-a879-85e87fb38c6b",
          "steps" => [
            {
              "type" => "messages",
              "messages" => [
                {
                  "app_user" => {
                    "id" => 1,
                    "kind" => "agent",
                    "email" => "bot@chasqik.com",
                    "display_name" => "bot"
                  },
                  "html_content" => "--***--",
                  "serialized_content" => MessageApis::BlockManager.serialized_text("sauper!")
                }
              ],
              "step_uid" => "73a9d3ec-05f2-4bc9-8fcc-89c51787bb3f"
            },
            {
              "type" => "messages",
              "controls" => { "type" => "wait_for_reply", "schema" => [] },
              "messages" => [],
              "step_uid" => "46c92a6e-37e9-4c77-8055-861e80b875bf"
            },
            {
              "type" => "messages",
              "messages" => [
                {
                  "app_user" => {
                    "id" => 1,
                    "kind" => "agent",
                    "email" => "bot@chasqik.com",
                    "display_name" => "bot"
                  },
                  "html_content" => "--***--",
                  "serialized_content" => MessageApis::BlockManager.serialized_text("oh si?")
                }
              ],
              "step_uid" => "26209898-0fb7-48c8-ad4c-356f46ff6c5c"
            },
            {
              "type" => "messages",
              "controls" => {
                "type" => "ask_option",
                "schema" => [
                  {
                    "id" => "82efa445-d5a4-40a6-a8cf-29c204f016f3",
                    "label" => "go to!",
                    "element" => "button",
                    "next_step_uuid" => "f2e7f51a-5c02-4777-9ef5-f4bba48412c4"
                  }
                ]
              },
              "messages" => [],
              "step_uid" => "3677eaf3-959c-4b0b-83e1-b1e802df7977"
            }
          ],
          "title" => "dos",
          "follow_actions" => nil
        },
        {
          "id" => "cf6d6018-2922-4b88-b0b7-d0d76e6c18f5",
          "steps" => [
            {
              "type" => "messages",
              "messages" => [
                {
                  "app_user" => {
                    "id" => 1,
                    "kind" => "agent",
                    "email" => "bot@chasqik.com",
                    "display_name" => "bot"
                  },
                  "html_content" => "--***--",
                  "serialized_content" => MessageApis::BlockManager.serialized_text("ah ah !")
                }
              ],
              "step_uid" => "f2e7f51a-5c02-4777-9ef5-f4bba48412c4"
            }
          ],
          "title" => "tres",
          "follow_actions" => nil
        }
      ],
      "bot_type" => "new_conversations"
      # "position"=>3
    }

    app.bot_tasks.create(attributes)
  end
end
