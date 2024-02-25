require "rails_helper"

RSpec.describe "Visitor Home Apps", type: :system, js: true do
  let!(:app) do
    Plugin.restore_plugins_from_fs

    FactoryBot.create(:app, encryption_key: "unodostrescuatro",
                            active_messenger: "true",
                            state: "enabled",
                            domain_url: "*")
  end

  let!(:agent_role) do
    app.add_admin({ email: "miguel.michelson@cience.com", name: "test agent", role: "admin" })
  end

  before :each do
    # Set up for ActiveJob, similar to cy.appEval('ActiveJob::Base.queue_adapter = :test')
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  it "user session home app" do
    # Replicate the addHomeApp functionality.
    # This includes updating the app's `user_home_apps` attribute with the provided JSON.

    app.update(
      user_home_apps: [
        {
          "definitions" => [
            { "type" => "separator" },
            { "type" => "text", "style" => "header", "text" => "hola!" },
            { "type" => "separator" },
            { "type" => "list", "disabled" => false,
              "items" => [
                {
                  "type" => "item",
                  "id" => "list-item-1",
                  "title" => "Welcome to Chaskiq mr user",
                  "subtitle" => "Chaskiq is a 100 open source conversational platform for sales & support",
                  "image" => "http://app.chaskiq.test:3000/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBYzg9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--bd639808dc87cfad87bef06c9838a40a562cd3e5/foo-1599423116.jpg",
                  "action" => { "type" => "url", "url" => "https://chaskiq.io" }
                }
              ] }
          ],
          "id" => "3", "name" => "ContentShowcase"
        }
      ]
    )

    # Visit the specific app testing page.
    open_new_messenger({ params: { lang: "en" } }, sessionless: false) do |page|
      expect(page).to have_content("Welcome to Chaskiq mr user")
    end
  end

  it "sessionless home app" do
    app.update(
      visitor_home_apps: [
        {
          "definitions" => [
            { "type" => "separator" },
            { "type" => "text", "style" => "header", "text" => "hola!" },
            { "type" => "separator" },
            { "type" => "list", "disabled" => false,
              "items" => [
                {
                  "type" => "item",
                  "id" => "list-item-1",
                  "title" => "Welcome to Chaskiq mr anonimous",
                  "subtitle" => "Chaskiq is a 100 open source conversational platform for sales & support",
                  "image" => "http://app.chaskiq.test:3000/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBYzg9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--bd639808dc87cfad87bef06c9838a40a562cd3e5/foo-1599423116.jpg",
                  "action" => { "type" => "url", "url" => "https://chaskiq.io" }
                }
              ] }
          ],
          "id" => "3", "name" => "ContentShowcase"
        }
      ]
    )

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("Welcome to Chaskiq mr anonimous")
    end
  end

  it "add package, test click" do
    add_app_package("UiCatalog")
    app.update(
      visitor_home_apps: [
        {
          "name" => "UiCatalog",
          "definitions" => [
            {
              "name" => "bubu",
              "label" => "Click this action",
              "type" => "button",
              "action" => {
                "type" => "submit"
              }
            }
          ]
        }
      ]
    )

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("Click this action")
      find_button("Click this action", match: :first).click
      expect(page).to have_content("yes!!!!!")
    end
  end

  it "add package, test content" do
    add_app_package("UiCatalog")

    app.update(
      visitor_home_apps: [
        {
          "name" => "UiCatalog",
          "definitions" => [
            {
              "id" => "oli",
              "name" => "bubu",
              "label" => "Click this action",
              "type" => "button",
              "action" => {
                "type" => "content",
                "content_url" => "/internal/ui_catalog"
              }
            }
          ]
        }
      ]
    )

    translations

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_button("Click this action")
      page.find_button("Click this action", match: :first).click
      expect(page).to have_content("dynamic")
      page.find("#ubu").click # Update this selector based on the actual content
      expect(page).to have_content("yes!!!!!")
    end
  end

  it "add package, frame 1" do
    add_app_package("UiCatalog")
    app.update(
      visitor_home_apps: [
        {
          "name" => "UiCatalog",
          "definitions" => [
            {
              "id" => "da",
              "name" => "bubu",
              "label" => "Click this action",
              "type" => "button",
              "action" => {
                "type" => "content",
                "content_url" => "/internal/ui_catalog"
              }
            },
            {
              "type" => "list",
              "disabled" => false,
              "items" => [
                {
                  "type" => "item",
                  "id" => "slug",
                  "title" => "a title",
                  "subtitle" => "subtitle",
                  "action" => {
                    "type" => "frame",
                    "url" => "/package_iframe_internal/UiCatalog"
                  }
                }
              ]
            }
          ]
        }
      ]
    )

    translations
    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("hello friend")
    end
  end

  it "add package, frame" do
    add_app_package("UiCatalog")
    add_app_package_to_home("user_home_apps", {
                              name: "UiCatalog",
                              definitions: [
                                {
                                  id: "da",
                                  name: "bubu",
                                  label: "Click this action",
                                  type: "button",
                                  action: {
                                    type: "content",
                                    content_url: "/internal/ui_catalog"
                                  }
                                },
                                {
                                  type: "list",
                                  disabled: false,
                                  items: [
                                    {
                                      type: "item",
                                      id: "slug",
                                      title: "a title",
                                      subtitle: "subtitle",
                                      action: {
                                        type: "frame",
                                        url: "/package_iframe_internal/UiCatalog"
                                      }
                                    }
                                  ]
                                }
                              ]
                            })

    translations

    open_new_messenger({ params: { lang: "en" } }, sessionless: true) do |page|
      expect(page).to have_content("hello friend")
    end
  end
end
