# frozen_string_literal: true

class AppPackagesCatalog
  def self.packages
    [
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
            grid: { xs: 12, sm: 12 }
          }
        ]
      },

      {
        name: 'FullContact',
        tag_list: ['enrichment'],
        description: 'Data Enrichment service',
        icon: 'https://logo.clearbit.com/fullcontact.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
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
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'credentials',
            type: 'string',
            grid: { xs: 12, sm: 12 }
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
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
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
            grid: { xs: 12, sm: 12 }
          },
        ]
      },
      {
        name: 'Slack',
        tag_list: ['conversations.added', 'email_changed'],
        state: 'enabled',
        description: 'Slack channel integration',
        icon: 'https://logo.clearbit.com/slack.com',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'access_token',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'access_token_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ]
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
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },

          {
            name: 'access_token',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },

          {
            name: 'access_token_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ]
      },


      {
        name: 'Zoom',
        tag_list: ['editor'],
        description: 'Zoom conference calls',
        icon: 'https://logo.clearbit.com/zoom.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'access_token',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input", 
              name: "src", 
              placeholder: "user email", 
              hint: "is the zoom owner email or zoom user id"
            }
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
        name: 'Calendly',
        tag_list: ['editor'],
        description: 'Clearbit data enrichment',
        icon: 'https://logo.clearbit.com/calendly.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ],
        editor_definitions: {
          requires: [
            { type: "input", name: "src", 
              placeholder: "put clendly url", 
              hint: "is the calendy url"
            }
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
        name: 'Dailytics',
        tag_list: ['dashboard'],
        description: 'Print Dailytics stats on your dashboard',
        icon: 'https://logo.clearbit.com/dailytics.com',
        state: 'enabled',
        definitions: [
          {
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'report_id',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
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
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
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
            name: 'api_key',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'verify_token',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          }
        ]
      }

    ]
  end

  def self.import
    AppPackage.create(packages)
  end

  def self.update(kind)
    data = packages.find{|o| o[:name].downcase === kind.downcase}
    pkg = AppPackage.find_or_create_by(name: data[:name])
    pkg.update(data) unless pkg.blank?
  end
end
