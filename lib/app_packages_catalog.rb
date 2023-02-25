# frozen_string_literal: true

class AppPackagesCatalog
  def self.packages(dev_packages: false)
    development_packages = [
      {
        name: "UiCatalog",
        description: "Sample Chaskiq UI kit, development sample",
        capability_list: %w[home conversations],
        state: "enabled",
        definitions: []
      },

      {
        name: "ExternalExample",
        tag_list: ["editor"],
        capability_list: %w[conversations home],
        description: "External example, development sample",
        icon: "",
        state: "enabled",
        initialize_url: "https://chaskiq-externa-api.glitch.me/initialize",
        configure_url: "https://chaskiq-externa-api.glitch.me/configure",
        submit_url: "https://chaskiq-externa-api.glitch.me/submit",
        sheet_url: "https://chaskiq-externa-api.glitch.me/sheet",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      }
    ]

    collection = [

      {
        name: "InboxSections",
        description: "Inbox base blocks for conversation sidebar",
        capability_list: ["inbox"],
        state: "enabled",
        definitions: []
      },

      {
        name: "ContentShowcase",
        description: "Promote relevant content to customers within your Messenger",
        capability_list: %w[home conversations bots],
        state: "enabled",
        definitions: []
      },

      {
        name: "ArticleSearch",
        description: "Let customers find and read help articles",
        capability_list: ["home"],
        state: "enabled",
        definitions: []
      },

      {
        name: "Qualifier",
        description: "Qualification for user",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      },

      {
        name: "Reveniu",
        description: "Reveniu Payment buttons",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      },

      {
        name: "Gumroad",
        description: "Gumroad Payment buttons",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      },

      {
        name: "Stripe",
        description: "Stripe Payment buttons",
        capability_list: %w[conversations bots],
        state: "enabled",
        definitions: []
      },

      {
        name: "Counto",
        capability_list: %w[conversation_part],
        description: "Send conversation part data from Admin panel",
        state: "enabled",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "endpoint_url",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Csat",
        capability_list: %w[conversations bot],
        tag_list: ["conversations.closed", "dashboard"],
        description: "Offers CSat capabilities",
        state: "enabled",
        definitions: []
      },

      {
        name: "AuditsReports",
        # capability_list: %w[],
        tag_list: ["dashboard"],
        description: "App Audits log reports",
        state: "enabled",
        definitions: []
      },

      {
        name: "Clearbit",
        tag_list: ["enrichment"],
        description: "Clearbit data enrichment",
        icon: "https://logo.clearbit.com/clearbit.com",
        state: "disabled",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "FullContact",
        tag_list: ["enrichment"],
        description: "Data Enrichment service",
        icon: "https://logo.clearbit.com/fullcontact.com",
        state: "enabled",
        capability_list: ["inbox"],
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "ContactFields",
        description: "Inbox contact fields editor",
        state: "enabled",
        capability_list: ["inbox"],
        definitions: []
      },

      {
        name: "OpenAi",
        tag_list: ["email_changed", "conversation.user.first.comment"],
        description: "Open AI GPT-3 tasks",
        icon: "https://logo.clearbit.com/openai.com",
        state: "enabled",
        capability_list: ["conversations"],
        definitions: [
          {
            name: "api_secret",
            label: "Auth Token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        tag_list: ["conversations.added"],
        capability_list: %w[conversations bots],
        name: "Dialogflow",
        description: "Convesation Bot integration from dialogflow",
        icon: "https://logo.clearbit.com/dialogflow.com",
        state: Rails.env.production? ? "disabled" : "enabled",
        definitions: [
          {
            name: "project_id",
            label: "project id",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            label: "credentials",
            hint: "JSON credential needed",
            name: "credentials",
            type: "textarea",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Helpscout",
        tag_list: ["crm"],
        description: "Will insert contacts",
        state: "disabled",
        icon: "https://logo.clearbit.com/helpscout.shop",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Pipedrive",
        tag_list: ["leads.convert", "email_changed"],
        description: "Pipedrive CRM integration, will insert contacts",
        icon: "https://logo.clearbit.com/pipedrive.com",
        state: "enabled",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            grid: { xs: "w-full", sm: "w-full" },
            required: true
          }
        ]
      },
      {
        name: "Slack",
        tag_list: [
          "email_changed",
          "conversation.user.first.comment",
          "conversations.assigned",
          "conversations.prioritized",
          "conversations.started",
          "conversations.added",
          "conversations.closed",
          "conversations.reopened"
        ],
        state: "enabled",
        description: "Slack channel integration",
        icon: "https://logo.clearbit.com/slack.com",
        credentials: if ENV["SLACK_CLIENT_ID"] && ENV["SLACK_CLIENT_SECRET"]
                       {
                         api_key: ENV["SLACK_CLIENT_ID"],
                         api_secret: ENV["SLACK_CLIENT_SECRET"]
                       }
                     else
                       {}
                     end,
        definitions: if !ENV["SLACK_CLIENT_ID"] && !ENV["SLACK_CLIENT_SECRET"]
                       [
                         {
                           name: "api_key",
                           label: "App ID",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         },
                         {
                           name: "api_secret",
                           label: "Client Secret",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         },
                         {
                           name: "slack_channel_name",
                           label: "Slack channel for Identified Contacts.",
                           hint: "This will be your primary channel.",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         },
                         {
                           name: "slack_channel_name_leads",
                           label: "Slack channel for Leads and Visitors.",
                           hint: "If you leave this blank you will be using the primary channel for Leads.",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         }
                       ]
                     else
                       [
                         {
                           name: "slack_channel_name",
                           label: "Slack channel for Identified Contacts.",
                           hint: "This will be your primary channel.",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         },
                         {
                           name: "slack_channel_name_leads",
                           label: "Slack channel for Leads and Visitors.",
                           hint: "If you leave this blank you will be using the primary channel for Leads.",
                           type: "string",
                           required: true,
                           grid: { xs: "w-full", sm: "w-full" }
                         }
                       ]
                     end
      },

      {
        name: "Twitter",
        tag_list: ["channel"],
        state: "enabled",
        description: "Twitter acount activity integration",
        icon: "https://logo.clearbit.com/twitter.com",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },

          {
            name: "access_token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },

          {
            name: "access_token_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Zoom",
        tag_list: ["editor"],
        capability_list: ["conversations"],
        description: "Zoom conference calls",
        icon: "https://logo.clearbit.com/zoom.com",
        state: "enabled",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "access_token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input",
              name: "src",
              placeholder: "user email",
              hint: "is the zoom owner email or zoom user id" }
          ],
          schema: [
            {
              name: "zoom",
              type: "button",
              label: "enter video call",
              element: "button",
              placeholder: "click button to open video call"
            }
          ]
        }
      },

      {
        name: "Whereby",
        tag_list: ["editor"],
        capability_list: ["conversations"],
        description: "whereby 1:1 conference calls",
        icon: "https://logo.clearbit.com/whereby.com",
        state: "enabled",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input",
              name: "src",
              placeholder: "user email",
              hint: "is the zoom owner email or zoom user id" }
          ],
          schema: [
            {
              name: "zoom",
              type: "button",
              label: "enter video call",
              element: "button",
              placeholder: "click button to open video call"
            }
          ]
        }
      },

      {
        name: "Cal",
        tag_list: ["editor"],
        capability_list: %w[conversations bots],
        description: "cal.com integration",
        icon: "https://logo.clearbit.com/cal.com",
        state: "enabled",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "key",
            type: "string",
            label: "Optional for license key",
            required: false,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "calendar_name",
            type: "string",
            hint: "which calendar to point, type \"mike\" for cal.com/mike ",
            required: false,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "url",
            type: "string",
            hint: "defaults to cal.com api",
            required: false,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input",
              name: "src",
              placeholder: "user email",
              hint: "is the zoom owner email or zoom user id" }
          ],
          schema: [
            {
              name: "zoom",
              type: "button",
              label: "enter video call",
              element: "button",
              placeholder: "click button to open video call"
            }
          ]
        }
      },

      {
        name: "Calendly",
        tag_list: ["editor"],
        capability_list: %w[conversations home],
        description: "Calendly meetings on conversations",
        icon: "https://logo.clearbit.com/calendly.com",
        state: "enabled",
        definitions: [
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input", name: "src",
              placeholder: "put clendly url",
              hint: "is the calendy url" }
          ],
          schema: [
            {
              name: "calendly",
              type: "button",
              label: "book a metting",
              element: "button",
              placeholder: "click button to open calendar"
            }
          ]
        }
      },

      {
        name: "Dailytics",
        tag_list: ["dashboard"],
        description: "Print Dailytics stats on your dashboard",
        icon: "https://logo.clearbit.com/dailytics.com",
        state: "enabled",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "report_id",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Twilio",
        tag_list: ["conversations.added"],
        capability_list: %w[conversations_initiator],
        description: "Interfaces twillio",
        icon: "https://logo.clearbit.com/twillio.com",
        state: "enabled",
        definitions: [
          {
            name: "user_id",
            label: "Phone",
            type: "string",
            required: true,
            hint: "The Twillio Whatsapp number (format: +14155231223)",
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            label: "Account SID",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_secret",
            label: "Auth Token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "new_conversations_after",
            label: "Count messages as new conversations",
            hint: "After a conversation is closed new messages will create a new conversation if there are received after this time period",
            type: "number",
            required: false,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "TwilioPhone",
        capability_list: %w[fixed_sidebar inbox],
        description: "Interfaces twilio telephony",
        state: "enabled",
        definitions: [
          {
            name: "account_sid",
            hint: "Twilio API credentials, Found at https://www.twilio.com/console",
            type: "string",
            required: true
          },
          {
            name: "application_sid",
            hint: "You need to create a TwiML app to use this project. Create one at https://www.twilio.com/console/phone-numbers/dev-tools/twiml-apps",
            type: "string",
            required: true
          },
          {
            name: "phone_number",
            hint: "Get your number at, https://www.twilio.com/console/phone-numbers/incoming",
            type: "string",
            required: true
          },
          {
            name: "api_key",
            hint: "Your REST API Key, https://www.twilio.com/console/project/api-keys",
            type: "string",
            required: true
          },
          {
            name: "api_secret",
            hint: "Your REST API Secret, https://www.twilio.com/console/project/api-keys",
            type: "string",
            required: true
          },
          {
            name: "auth_token",
            hint: "Find your Auth Token at twilio.com/console",
            type: "string",
            required: true
          }
        ]
      },

      {
        name: "Vonage",
        tag_list: ["conversations.added"],
        description: "Interfaces Vonage Whatsapp",
        icon: "https://logo.clearbit.com/vonage.com",
        state: Rails.env.production? ? "disabled" : "enabled",
        definitions: [
          {
            name: "user_id",
            label: "Phone",
            type: "string",
            required: true,
            hint: "The Vonage Whatsapp number (format: 14155231223)",
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            label: "Your Vonage API key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_secret",
            label: "Your Vonage API secret",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "sandbox",
            label: "is sandbox",
            type: "checkbox",
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "MessageBird",
        tag_list: ["conversations.added"],
        description: "Interfaces MessageBird Whatsapp",
        icon: "https://logo.clearbit.com/MessageBird.com",
        state: Rails.env.production? ? "disabled" : "enabled",
        definitions: [
          {
            name: "user_id",
            label: "Phone",
            type: "string",
            required: true,
            hint: "The MessageBird Whatsapp number (format: +14155231223)",
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            label: "Your MessageBird API key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "sandbox",
            label: "is sandbox",
            type: "checkbox",
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Dialog360",
        tag_list: ["conversations.added"],
        description: "Interfaces 360 Dialog Whatsapp",
        icon: "https://logo.clearbit.com/360 Dialog.com",
        state: "enabled",
        capability_list: %w[conversations bots conversations_initiator],
        definitions: [
          {
            name: "user_id",
            label: "Phone",
            type: "string",
            required: true,
            hint: "The 360 Dialog Whatsapp number (format: 14155231223)",
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "api_key",
            label: "Your 360Dialog API key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "sandbox",
            label: "is sandbox",
            type: "checkbox",
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Telegram",
        tag_list: ["conversations.added"],
        description: "Interfaces Telegram Messaging",
        icon: "https://logo.clearbit.com/Telegram",
        state: "enabled",
        capability_list: %w[conversations bots],
        definitions: [
          {
            name: "access_token",
            label: "Your Telegram Bot token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "Zapier",
        tag_list: [
          "conversations.started",
          "conversations.assigned",
          "conversations.added",
          "conversations.closed",
          "users.created"
        ],
        description: "Interfaces Zapier template",
        icon: "https://logo.clearbit.com/zapier.com",
        state: "enabled",
        definitions: [
          {
            name: "access_token",
            type: "string",
            label: "Password",
            hint: "Put a password to be used in the Zapier auth",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }

        ]
      },

      {
        name: "Messenger",
        tag_list: ["conversations.added"],
        description: "Interfaces Facebook Messenger",
        icon: "https://logo.clearbit.com/messenger.com",
        state: "enabled",
        definitions: [
          {
            name: "access_token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "verify_token",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }
        ]
      },

      {
        name: "TelnyxSms",
        description: "Interfaces Telnyx SMS",
        icon: "https://logo.clearbit.com/telnyx.com",
        state: "enabled",
        definitions: [
          {
            name: "api_key",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "profile_id",
            type: "string",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          },
          {
            name: "phones",
            label: "Numbers pool",
            hint: "Desired format ie: +17777777777, add comma separated values for your phones, ie:. phone1,phone2,phone3",
            type: "textarea",
            required: true,
            grid: { xs: "w-full", sm: "w-full" }
          }

        ]
      }
    ]

    collection = development_packages + collection if dev_packages
    collection
  end

  def self.import
    AppPackage.create(packages)
  end

  def self.update(kind)
    data = packages.find { |o| o[:name].downcase === kind.downcase }
    pkg = AppPackage.find_or_create_by(name: data[:name])
    pkg.update(data) if pkg.present?
  end

  def self.update_all(dev_packages: false)
    packages(dev_packages: dev_packages).each do |pkg|
      package = AppPackage.find_or_create_by(name: pkg[:name])
      package.update(pkg)

      Rails.logger.debug { "PACKAGE #{package.name} errors: #{package.errors.full_messages.join(', ')}" } if package.errors.any?
    end
  end
end
