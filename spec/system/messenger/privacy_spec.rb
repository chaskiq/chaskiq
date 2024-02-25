require "rails_helper"

RSpec.describe "Privacy Spec", type: :system, js: true do
  let!(:app) do
    # Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  before do
    # Setup basic app scenario
    # ...
  end

  it "data protection all en" do
    app.update(privacy_consent_required: "all")

    open_new_messenger({ params: { lang: "en" } }) do |page|
      expect(page).to have_content("Data Protection")
      expect(App.last.app_users.last.lang).to eq("en")
      page.click_button("Yes, Accept")
    end
  end

  it "data protection all es" do
    app.update(privacy_consent_required: "all")

    open_new_messenger({ params: { lang: "es" } }) do |page|
      expect(page).to have_content("Protecci\u00F3n de datos")
      expect(App.last.app_users.size).to eq(1)
      expect(App.last.app_users.last.lang).to eq("es")
      page.click_button("Si, Confirmar")
    end
  end

  it "data protection none es" do
    app.update(privacy_consent_required: "none")

    open_new_messenger({ params: { lang: "es" } }) do |page|
      expect(page).not_to have_content("Protecci\u00F3n de datos")
      expect(App.last.app_users.last.lang).to eq("es")
      expect(page).not_to have_content("Si, Confirmar")
    end
  end
end
