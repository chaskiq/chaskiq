class Apps::ReportsController < ApplicationController
  before_action :find_app
  before_action :set_navigation
  before_action :set_dashboard

  def show
    if params[:id] == "overview"
      @integration = {
        name: "overview",
        icon: nil,
        paths: chart_data.map { |k, v| v.merge({ kind: k }) }
      }
    else
      integration = AppPackageDashboard.app_package(@app, params[:id])

      @integration = {
        name: integration.app_package.name,
        icon: integration.app_package.icon,
        package: integration.app_package.name,
        id: integration.id,
        paths: integration.message_api_klass.try(:report_kinds) || []
      }
    end

    render "report_overview" and return
  end

  def index
    # @dashboard = AppPackageDashboard.app_packages_list(@app)
  end

  private

  def set_dashboard
    @dashboard =
      AppPackageDashboard.app_packages_list(@app) << {
        name: "overview",
        icon: nil,
        paths: "overview"
      }
  end

  def set_navigation
    @navigator = "apps/reports/navigator"
  end

  def report_overview
    @dashboard =
      Dashboard
      .new(
        app: @app,
        range: {
          from: 10.days.ago.to_s,
          to: Time.zone.now.to_s
        }
      )
      .send(params[:id])

    resolve_partial

    render turbo_stream: [
      turbo_stream.replace(
        "dashboard_#{params[:id]}",
        partial: resolve_partial[:type],
        locals: {
          app: @app,
          props: @partial_data
        }
      )
    ]
  end

  def resolve_partial
    @partial_data = chart_data[params[:id].to_sym]
  end

  def chart_data
    {
      app_packages: {
        label: I18n.t("dashboard.user_country"),
        type: "app_packages"
      },
      first_response_time: {
        type: "count",
        label: I18n.t("dashboard.response_avg"),
        append_label: "Hrs"
      },
      opened_conversations: {
        type: "count",
        label: I18n.t("dashboard.new_conversations")
      },
      solved_conversations: {
        type: "count",
        label: I18n.t("dashboard.resolutions"),
        append_label: ""
      },
      incoming_messages: {
        type: "count",
        label: I18n.t("dashboard.incoming_messages")
      },
      visits: {
        type: "heatMap"
      },
      browser: {
        type: "pie",
        label: I18n.t("dashboard.browser")
      },
      lead_os: {
        type: "pie",
        label: I18n.t("dashboard.lead_os")
      },
      user_os: {
        type: "pie",
        label: I18n.t("dashboard.user_os")
      },
      user_country: {
        type: "pie",
        label: I18n.t("dashboard.user_country")
      }
    }
  end
end
