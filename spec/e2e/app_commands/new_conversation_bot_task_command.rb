app = App.find_by(key: command_options.fetch("app_key"))
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

bot = app.bot_tasks.create(attributes)

bot
