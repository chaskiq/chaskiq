require "rails_helper"

RSpec.describe "Banners Spec", type: :system, js: true do
  let(:app_key) { App.last.key }

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

  def banner_command(options)
    # frozen_string_literal: true
    message = options[:serialized_content]

    serialized_content = MessageApis::BlockManager.serialized_text(message)

    message = FactoryBot.create(:banner,
                                serialized_content: serialized_content,
                                app: app,
                                segments: nil, # app.segments.first.predicates,
                                scheduled_at: 2.days.ago,
                                scheduled_to: 30.days.from_now,
                                settings: options)

    message.enable!
  end

  before do
    # Setup basic app scenario
    # ...
  end

  it "will open, hidden on next visit" do
    # Setup banner command
    # ...

    banner_command({
                     serialized_content: "tatecallaoe",
                     app_key: app_key,
                     url: "",
                     mode: "inline",
                     bg_color: "#bd10e0",
                     placement: "top",
                     action_text: "action",
                     show_sender: "",
                     dismiss_button: "true",
                     hidden_constraints: ["open"]
                   })

    visit "/tester/#{app_key}"
    sleep(3) # Replace with appropriate wait_for_ajax or similar helper if available

    within_frame(find("iframe[data-cy=banner-wrapper]")) do
      expect(page).to have_button("action", type: "submit")
    end

    visit "/tester/#{app_key}"
    expect(page).not_to have_css("iframe[data-cy=banner-wrapper]")
  end

  it "will click, hidden on next visit" do
    banner_command({
                     serialized_content: "tatecallaoe",
                     app_key: app_key,
                     url: "",
                     mode: "inline",
                     bg_color: "#bd10e0",
                     placement: "top",
                     action_text: "action",
                     show_sender: "",
                     dismiss_button: "true",
                     hidden_constraints: ["click"]
                   })

    visit "/tester/#{app_key}"
    sleep(3)

    within_frame(find("iframe[data-cy=banner-wrapper]")) do
      expect(page).to have_button("action", type: "submit")
    end

    visit "/tester/#{app_key}"
    expect(page).not_to have_css("iframe[data-cy=banner-wrapper]")
  end

  it "will open and close button" do
    banner_command({
                     serialized_content: "tatecallaoe",
                     app_key: app_key,
                     url: "",
                     mode: "inline",
                     bg_color: "#bd10e0",
                     placement: "top",
                     action_text: "action",
                     show_sender: "",
                     dismiss_button: "true",
                     hidden_constraints: ["close"]
                   })

    visit "/tester/#{app_key}"
    sleep(3)

    within_frame(find("iframe[data-cy=banner-wrapper]")) do
      find(".dismiss-button").click
    end

    visit "/tester/#{app_key}"
    expect(page).not_to have_css("iframe[data-cy=banner-wrapper]")
  end

  it "will open and keep open" do
    banner_command({
                     serialized_content: "tatecallaoe",
                     app_key: app_key,
                     url: "",
                     mode: "inline",
                     bg_color: "#bd10e0",
                     placement: "top",
                     action_text: "Action",
                     show_sender: "",
                     dismiss_button: "true",
                     hidden_constraints: ["close"]
                   })

    visit "/tester/#{app_key}"
    sleep(3)

    within_frame(find("iframe[data-cy=banner-wrapper]")) do
      expect(page).to have_button("Action", type: "submit")
    end

    visit "/tester/#{app_key}"
    expect(page).to have_css("iframe[data-cy=banner-wrapper]")
  end
end
