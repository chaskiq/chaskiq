require "rails_helper"

RSpec.describe "Event Triggering", type: :system, js: true do
  let!(:app) do
    Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  before do
    # Setup for ActiveJob and any other initial conditions
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  it "wakeup & toggle method" do
    visit "/tester/#{app.key}"

    # open_new_messenger({params: { lang: 'en' }}) do |page|
    # The following steps simulate the Cypress steps within the iframe context
    # Note that direct execution of custom JS commands may vary in Capybara

    sleep(2)
    # Execute 'wakeup' command
    page.execute_script("window.chaskiqMessenger.sendCommand('wakeup', {})")
    sleep(1) # Wait for any changes to take effect

    # Assert the frame-wrapper data attribute to be true
    expect(page).to have_css("#frame-wrapper[data-open='true']")

    # Execute 'toggle' command
    page.execute_script("window.chaskiqMessenger.sendCommand('toggle', {})")
    sleep(1) # Wait for any changes to take effect

    # Assert the frame-wrapper data attribute to be false

    # expect(page).to have_css("#frame-wrapper[data-open='false']")
    expect(page.body.include?('<div id="frame-wrapper" data-open="false" ')).to be == true
    # end
  end
end
