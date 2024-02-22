# frozen_string_literal: true

FactoryBot.define do
  factory :app do
    name { "my app" }
    domain_url { "http://localhost:3000" }
  end
end

FactoryBot.define do
  factory :campaign, class: "Campaign" do
    name { "some Campaign" }
    subject { "Hello" }
    from_name { "Me" }
    # from_email { "me@me.com" }
    # reply_email { "reply-me@me.com" }
    # plain_content "hi this is the plain content"
    # html_content "<h1>hi this is htmlcontent </h1>"
    # query_string "opt=1&out=2"
    # scheduled_at "2015-03-17 23:10:06"
    # timezone "utc-4"
    # recipients_count 1
    # sent false
    # opens_count 1
    # clicks_count 1
    # parent nil
  end
end

FactoryBot.define do
  factory :conversation do
  end

  factory :conversation_part do
  end

  factory :conversation_part_block do
    blocks do
      {
        app_package: "app_package",
        schema: []
      }
    end
  end

  factory :conversation_part_content do
    serialized_content { { content: "my-content" }.as_json }
  end

  factory :conversation_part_event do
    data do
      {
        element: "button",
        label: "Test"
      }
    end
  end
end

FactoryBot.define do
  factory :user_auto_message, class: "UserAutoMessage" do
    name { "some Campaign" }
    subject { "Hello" }
    from_name { "Me" }
    from_email { "me@me.com" }
    reply_email { "reply-me@me.com" }
    # plain_content "hi this is the plain content"
    # html_content "<h1>hi this is htmlcontent </h1>"
    # query_string "opt=1&out=2"
    scheduled_at { "2015-03-17 23:10:06" }
    scheduled_to { "2015-03-17 23:10:06" }
    # timezone "utc-4"
    # recipients_count 1
    # sent false
    # opens_count 1
    # clicks_count 1
    # parent nil
  end
end

FactoryBot.define do
  factory :banner, class: "Banner" do
    name { "some Campaign" }
    subject { "Hello" }
    # plain_content "hi this is the plain content"
    # html_content "<h1>hi this is htmlcontent </h1>"
    # query_string "opt=1&out=2"
    scheduled_at { "2015-03-17 23:10:06" }
    scheduled_to { "2015-03-17 23:10:06" }
    # timezone "utc-4"
    # recipients_count 1
    # sent false
    # opens_count 1
    # clicks_count 1
    # parent nil
  end
end

FactoryBot.define do
  factory :metric, class: "Metric" do
    trackable { nil }
  end
end

FactoryBot.define do
  factory :user do
    email { "user@example.com" }
  end
end
