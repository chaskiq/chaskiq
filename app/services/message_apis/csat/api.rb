# frozen_string_literal: true
module MessageApis::Csat
  class Api
    attr_accessor :secret

    def initialize(config:)
      @secret = secret
      @api_key = config["api_key"]
      @url = config["endpoint_url"]
    end

    # reports
    def report_kinds
      [
        {
          chartType: 'app_package',
          kind: 'general',
          label: 'dddd',
          appendLabel: 'Hrs',
          classes: 'col-span-4',
          styles: {a:1}
        },
        {
          chartType: 'table',
          kind: 'events_table',
          label: 'events table',
          appendLabel: 'Hrs',
          classes: 'col-span-4'
        }
      ]
    end

    def report(path, integration, options)
      case path
      when 'general'
        options = integration.app.conversation_events.custom_counts
        {
          id: 'ididid',
          title: 'Conversation ratings',
          subtitle: 'csat plugin',
          package_icon: integration.app_package.icon,
          package_name: integration.app_package.name,
          values: options.map do |o|
            {
              label: o.val,
              name: o.val,
              value: o.freq,
              value2: nil
            }
          end
        }
      when 'events_table'
        collection = integration.app.conversation_events.where(
          "events.action =?", 'plugins.csat'
        ).page(options[:page]).per(1)

        {
          collection: collection.map(&:serialize_properties),
          columns: [
            # { field: 'action', title: 'action' },
            { field: 'value', title: 'value' },
            { field: 'label', title: 'label' },
            { field: 'comment', title: 'comment' },
          ],
          meta: {
            current_page: collection.current_page,
            next_page: collection.next_page,
            prev_page: collection.prev_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count
          }
        }
      when 'custom'
        100
      else
        
      end
    end
  end
end
