require "rails_helper"

RSpec.describe "Translations Spec", type: :system, js: true do
  let!(:app) do
    Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  let!(:agent) do
    agent = app.add_agent({
                            email: "test@test.cl",
                            name: "sharleena",
                            password: "123456",
                            password_confirmation: "123456"
                          },
                          role_attrs: {
                            role: "admin"
                          })
    agent.agent
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

  before :each do
    translations
  end

  it "user lang en" do
    open_new_messenger({ params: { lang: "en" } }) do |page|
      expect(page).to have_content("Start a conversation")
      expect(page).to have_content("hello friend")
      expect(page).to have_content("we are here to help")

      # Verifying app user properties
      expect(app.app_users.size).to eq(1)
      expect(app.app_users.last.lang).to eq("en")
    end
  end

  it "user lang es" do
    open_new_messenger({ params: { lang: "es" } }) do
      expect(page).to have_content("Inicia una conversaci\u00F3n")
      expect(app.app_users.size).to eq(1)
      expect(app.app_users.last.lang).to eq("es")
      expect(app.app_users.last.name).to eq("miguel")
    end
  end

  it "visitor lang en" do
    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do
      expect(page).to have_content("Start a conversation")
      expect(page).to have_content("hello friend")
      expect(app.app_users.size).to eq(1)
    end
  end

  it "visitor lang es property" do
    open_new_messenger({ params: { lang: "es" } }, sessionless: true) do
      expect(page).to have_content("Inicia una conversaci\u00F3n")
      expect(page).to have_content("Hola")
      expect(app.app_users.size).to eq(1)
      expect(Visitor.last.lang).to eq("es")
    end
  end

  it "lang en start conversation" do
    # app.add_user(email: "test@test.cl")

    # start_conversation_from_agent

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do
      expect(page).to have_content("Start a conversation")
      expect(page).to have_content("hello")
      expect(app.app_users.size).to eq(1)

      start_conversation_from_agent

      sleep(2)
      # expect(Visitor.last.lang).to eq('en')
      # click_link("See previous")

      # sleep(2)
      expect(page).to have_content("foobar")
    end
  end

  # Additional test cases...
end
