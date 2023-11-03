# frozen_string_literal: true

module MessageApis::Csat
  class Api
    attr_accessor :secret

    def initialize(config:)
      @secret = secret
      @api_key = config["api_key"]
      @url = config["endpoint_url"]
    end

    def self.definition_info
      {
        name: "Csat",
        capability_list: %w[conversations bot],
        tag_list: ["conversations.closed", "dashboard"],
        description: "Offers CSat capabilities",
        state: "enabled",
        definitions: []
      }
    end

    # reports
    def report_kinds
      [
        {
          chartType: "app_package",
          kind: "general",
          label: "dddd",
          appendLabel: "Hrs",
          classes: "col-span-4",
          styles: { a: 1 }
        },
        {
          chartType: "table",
          kind: "events_table",
          label: "events table",
          appendLabel: "Hrs",
          classes: "col-span-4"
        }
      ]
    end

    def report(path, integration, options)
      case path
      when "general"
        options = integration.app.conversation_events.custom_counts("plugins.csat", "val")
        data_options = MessageApis::Csat::Presenter.csat_buttons[:options]

        total = options.map { |o| o.freq.to_f }.inject(:+)

        {
          id: "csat-plugin",
          title: "Conversation ratings",
          subtitle: "csat plugin",
          package_icon: integration.app_package.icon,
          package_name: integration.app_package.name,
          values: options.map do |o|
            {
              label: data_options.find { |d| d[:id] === o.val }[:text],
              name: o.val,
              value: "#{(o.freq.to_f / total * 100.0).ceil(1)}%",
              value2: "#{o.freq} events"
            }
          end
        }
      when "events_table"
        collection = integration.app.conversation_events.where(
          "events.action =?", "plugins.csat"
        ).page(options[:page]).per(10)

        {
          collection: collection.map(&:serialize_properties),
          columns: [
            # { field: 'action', title: 'action' },
            { field: "value", title: "value" },
            { field: "label", title: "label" },
            { field: "comment", title: "comment" }
          ],
          meta: {
            current_page: collection.current_page,
            next_page: collection.next_page,
            prev_page: collection.prev_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count
          }
        }
      when "custom"
        100
      end
    end

    def trigger(event)
      subject = event.eventable
      action = event.action
      case action
      when "conversations.closed" then send_survey(subject)
      end
    end

    def send_survey(subject)
      data = MessageApis::Csat::Presenter.csat_buttons

      author = subject.app.agents.bots.first

      controls = {
        app_package: "Csat",
        schema: [data],
        type: "app_package",
        wait_for_input: true
      }

      subject.add_message(
        from: author,
        controls: controls
      )
    end
  end
end
