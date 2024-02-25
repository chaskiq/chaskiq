require "rails_helper"

RSpec.describe "Availability Spec", type: :system, js: true do
  before do
    # Setup ActiveJob similar to Cypress
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  it "couple of hours" do
    # Setup basic app scenario
    # ...

    # Calculate the time for schedule setup
    now = Time.current
    weekday = I18n.l(now, format: "%a").downcase
    start_time = (now + 1.hour).strftime("%H:%M")
    end_time = (now + 1.hour + 15.minutes).strftime("%H:%M")

    # Update the app's schedule
    App.last.update(
      timezone: "UTC",
      team_schedule: [{ day: weekday, from: start_time, to: end_time }]
    )

    app = App.last
    visit "/tester/#{app.key}?lang=en"

    # Interact with the content inside the iframe
    within_frame(find("iframe:first")) do
      find("#chaskiq-prime").click
      expect(page).to have_content("approximately")
    end

    # Repeat the visit and check for the Spanish language
    visit "/tester/#{app.key}?lang=es"
    within_frame(find("iframe")) do
      find("#chaskiq-prime").click
      expect(page).to have_content("aprox")
    end
  end
end
