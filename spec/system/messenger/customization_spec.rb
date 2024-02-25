require "rails_helper"

RSpec.describe "Customization Spec", type: :system, js: true do
  let!(:app) do
    Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    # Setup basic app scenario
    # ...
  end

  it "display colourful" do
    app.update(customization_colors: { primary: "#0f0", secondary: "#f00" })

    open_new_messenger({ params: { lang: "en" } }) do |_page|
      expect(app.customization_colors).to be_present
    end
  end

  it "display default" do
    app.update(customization_colors: nil)

    open_new_messenger({ params: { lang: "en" } }) do |_page|
      expect(app.customization_colors).to be_nil
    end
  end

  it "display default on secondary color" do
    app.update(customization_colors: { primary: "#0f0", pattern: "https://..." })

    open_new_messenger({ params: { lang: "en" } }) do |_page|
      expect(app.customization_colors).to be_present
    end
  end
end
