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
            name: 'api_secret',
            type: 'string',
            grid: { xs: 12, sm: 12 }
          },
          {
            name: 'project_id',
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
        tag_list: ['crm'],
        description: 'Pipedrive CRM integration, will insert contacts',
        icon: 'https://logo.clearbit.com/pipedrive.com',
        state: 'disabled',
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
        name: 'Slack',
        tag_list: ['channel'],
        state: 'disabled',
        description: 'Slack channel integration',
        icon: 'https://logo.clearbit.com/slack.com',
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
      }
    ]
  end

  def self.import
    AppPackage.create(packages)
  end
end
