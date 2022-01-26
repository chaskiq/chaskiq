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
          label: "events table1",
          appendLabel: "Hrs",
          classes: "col-span-4",
          styles: {}
        }
      ]
    end

    def report(path, integration, options)
      case path
      when "events_table"
        ids = integration.app.agents.ids

        app = integration.app

        collection = Audit.union_scope(
          integration.app.audits,
          Audit.where(auditable_type: "Agent", auditable_id: ids)
        )
                          .order("id desc")
                          .page(options[:page])
                          .per(10)
        {
          collection: collection.map { |o| o.serialize_properties(app) },
          columns: [
            # { field: 'action', title: 'action' },
            { field: "id", title: "id" },
            { field: "auditable_type", title: "Type" },
            { field: "auditable_id", title: "Type Id" },
            { field: "auditable_link", title: "link", renderer_type: "markdown" },
            { field: "action", title: "Action" },
            { field: "agent_name", title: "Agent" },
            { field: "agent_email", title: "Agent Email", renderer_type: "markdown" },
            { field: "created_at", title: "Date" },
            { field: "sdata", title: "Data" }
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
