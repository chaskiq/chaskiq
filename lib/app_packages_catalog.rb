# frozen_string_literal: true

class AppPackagesCatalog
  def self.packages(dev_packages: false)
    development_packages = [
      {
        name: 'UiCatalog',
        description: 'Sample Chaskiq UI kit, development sample',
        capability_list: %w[home conversations],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'ExternalExample',
        tag_list: ['editor'],
        capability_list: %w[conversations home],
        description: 'External example, development sample',
        icon: '',
        state: 'enabled',
        initialize_url: 'https://chaskiq-externa-api.glitch.me/initialize',
        configure_url: 'https://chaskiq-externa-api.glitch.me/configure',
        submit_url: 'https://chaskiq-externa-api.glitch.me/submit',
        sheet_url: 'https://chaskiq-externa-api.glitch.me/sheet',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      }
    ]

    collection = [

      {
        name: 'InboxSections',
        description: 'Inbox base blocks for conversation sidebar',
        capability_list: ['inbox'],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'ContentShowcase',
        description: 'Promote relevant content to customers within your Messenger',
        capability_list: %w[home conversations bots],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'ArticleSearch',
        description: 'Let customers find and read help articles',
        capability_list: ['home'],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'Qualifier',
        description: 'Qualification for user',
        capability_list: %w[conversations bots],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'Reveniu',
        description: 'Reveniu Payment buttons',
        capability_list: %w[conversations bots],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'Gumroad',
        description: 'Gumroad Payment buttons',
        capability_list: %w[conversations bots],
        state: 'enabled',
        definitions: []
      },

      {
        name: 'Clearbit',
        tag_list: ['enrichment'],
        description: 'Clearbit data enrichment',
        icon: 'https://logo.clearbit.com/clearbit.com',
        state: 'disabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'FullContact',
        tag_list: ['enrichment'],
        description: 'Data Enrichment service',
        icon: 'https://logo.clearbit.com/fullcontact.com',
        state: 'enabled',
        capability_list: ['inbox'],
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'OpenAi',
        tag_list: ['email_changed', 'conversation.user.first.comment'],
        description: 'Open AI GPT-3 tasks',
        icon: 'https://logo.clearbit.com/openai.com',
        state: 'enabled',
        capability_list: ['conversations'],
        definitions: [
          {
            name: 'api_secret',
            label: 'Auth Token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Dialogflow',
        tag_list: ['bot'],
        description: 'Convesation Bot integration from dialogflow',
        icon: 'https://logo.clearbit.com/dialogflow.com',
        state: 'disabled',
        definitions: [
          {
            name: 'project_id',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'credentials',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Helpscout',
        tag_list: ['crm'],
        description: 'Will insert contacts',
        state: 'disabled',
        icon: 'https://logo.clearbit.com/helpscout.shop',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Pipedrive',
        tag_list: ['leads.convert', 'email_changed'],
        description: 'Pipedrive CRM integration, will insert contacts',
        icon: 'https://logo.clearbit.com/pipedrive.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 'w-full', sm: 'w-full' },
            required: true
          }
        ]
      },
      {
        name: 'Slack',
        tag_list: ['email_changed', 'conversation.user.first.comment'],
        state: 'enabled',
        description: 'Slack channel integration',
        icon: 'https://logo.clearbit.com/slack.com',
        credentials: if ENV['SLACK_CLIENT_ID'] && ENV['SLACK_CLIENT_SECRET']
                       {
                         api_key: ENV['SLACK_CLIENT_ID'],
                         api_secret: ENV['SLACK_CLIENT_SECRET']
                       }
                     else
                       {}
                     end,
        definitions: if !ENV['SLACK_CLIENT_ID'] && !ENV['SLACK_CLIENT_SECRET']
                       [
                         {
                           name: 'api_key',
                           label: 'App ID',
                           type: 'string',
                           required: true,
                           grid: { xs: 'w-full', sm: 'w-full' }
                         },
                         {
                           name: 'api_secret',
                           label: 'Client Secret',
                           type: 'string',
                           required: true,
                           grid: { xs: 'w-full', sm: 'w-full' }
                         }
                       ]
                     else
                       []
                     end
      },

      {
        name: 'Twitter',
        tag_list: ['channel'],
        state: 'enabled',
        description: 'Twitter acount activity integration',
        icon: 'https://logo.clearbit.com/twitter.com',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },

          {
            name: 'access_token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },

          {
            name: 'access_token_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Zoom',
        tag_list: ['editor'],
        capability_list: ['conversations'],
        description: 'Zoom conference calls',
        icon: 'https://logo.clearbit.com/zoom.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'access_token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ],
        editor_definitions: {
          requires: [
            { type: 'input',
              name: 'src',
              placeholder: 'user email',
              hint: 'is the zoom owner email or zoom user id' }
          ],
          schema: [
            {
              name: 'zoom',
              type: 'button',
              label: 'enter video call',
              element: 'button',
              placeholder: 'click button to open video call'
            }
          ]
        }
      },

      {
        name: 'Calendly',
        tag_list: ['editor'],
        capability_list: %w[conversations home],
        description: 'Calendly meetings on conversations',
        icon: 'https://logo.clearbit.com/calendly.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ],
        editor_definitions: {
          requires: [
            { type: 'input', name: 'src',
              placeholder: 'put clendly url',
              hint: 'is the calendy url' }
          ],
          schema: [
            {
              name: 'calendly',
              type: 'button',
              label: 'book a metting',
              element: 'button',
              placeholder: 'click button to open calendar'
            }
          ]
        }
      },

      {
        name: 'Dailytics',
        tag_list: ['dashboard'],
        description: 'Print Dailytics stats on your dashboard',
        icon: 'https://logo.clearbit.com/dailytics.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'report_id',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Twilio',
        tag_list: ['conversations.added'],
        description: 'Interfaces twillio',
        icon: 'https://logo.clearbit.com/twillio.com',
        state: 'enabled',
        definitions: [
          {
            name: 'user_id',
            label: 'Phone',
            type: 'string',
            required: true,
            hint: 'The Twillio Whatsapp number (format: +14155231223)',
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            label: 'Account SID',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_secret',
            label: 'Auth Token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Vonage',
        tag_list: ['conversations.added'],
        description: 'Interfaces Vonage Whatsapp',
        icon: 'https://logo.clearbit.com/vonage.com',
        state: Rails.env.production? ? 'disabled' : 'enabled',
        definitions: [
          {
            name: 'user_id',
            label: 'Phone',
            type: 'string',
            required: true,
            hint: 'The Vonage Whatsapp number (format: 14155231223)',
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            label: 'Your Vonage API key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_secret',
            label: 'Your Vonage API secret',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'sandbox',
            label: 'is sandbox',
            type: 'checkbox',
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'MessageBird',
        tag_list: ['conversations.added'],
        description: 'Interfaces MessageBird Whatsapp',
        icon: 'https://logo.clearbit.com/MessageBird.com',
        state: Rails.env.production? ? 'disabled' : 'enabled',
        definitions: [
          {
            name: 'user_id',
            label: 'Phone',
            type: 'string',
            required: true,
            hint: 'The MessageBird Whatsapp number (format: +14155231223)',
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            label: 'Your MessageBird API key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'sandbox',
            label: 'is sandbox',
            type: 'checkbox',
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Dialog360',
        tag_list: ['conversations.added'],
        description: 'Interfaces 360 Dialog Whatsapp',
        icon: 'https://logo.clearbit.com/360 Dialog.com',
        state: 'enabled',
        capability_list: %w[conversations bots],
        definitions: [
          {
            name: 'user_id',
            label: 'Phone',
            type: 'string',
            required: true,
            hint: 'The 360 Dialog Whatsapp number (format: 14155231223)',
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'api_key',
            label: 'Your 360Dialog API key',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'sandbox',
            label: 'is sandbox',
            type: 'checkbox',
            grid: { xs: 'w-full', sm: 'w-full' }
          }
        ]
      },

      {
        name: 'Messenger',
        tag_list: ['conversations.added'],
        description: 'Interfaces Facebook Messenger',
        icon: 'https://logo.clearbit.com/messenger.com',
        state: 'enabled',
        definitions: [
          {
            name: 'access_token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            name: 'verify_token',
            type: 'string',
            required: true,
            grid: { xs: 'w-full', sm: 'w-full' }
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
    pkg.update(data) unless pkg.blank?
  end

  def self.update_all(dev_packages: false)
    packages(dev_packages: dev_packages).each do |pkg|
      package = AppPackage.find_or_create_by(name: pkg[:name])
      package.update(pkg)
      puts "PACKAGE #{package.name} errors: #{package.errors.full_messages.join(', ')}" if package.errors.any?
    end
  end
end
