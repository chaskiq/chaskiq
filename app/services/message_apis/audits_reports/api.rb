# frozen_string_literal: true

module MessageApis::AuditsReports
  class Api
    attr_accessor :secret

    def initialize(config:); end

    # reports
    def report_kinds
      [
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
      when "events_table"
        collection = integration.app.audits.page(options[:page]).per(10)

        {
          collection: collection.map(&:serialize_properties),
          columns: [
            # { field: 'action', title: 'action' },
            { field: "id", title: "id" },
            { field: "auditable_type", title: "Type" },
            { field: "action", title: "Action" },
            { field: "agent_name", title: "Agent" },
            { field: "agent_email", title: "Agent Email" },
            { field: "created_at", title: "Date" }
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

    def trigger(event); end
  end
end
