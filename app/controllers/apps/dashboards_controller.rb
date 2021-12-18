class Apps::DashboardsController < ApplicationController
  before_action :find_app

  def show
    range = { from: 10.days.ago.to_s, to: Time.zone.now.to_s }

    @dashboard =
      if params[:integration_id].present?
        #package = @app.app_package_integrations.find(params[:integration_id])
        AppPackageDashboard
          .new(app: @app, range: range, package: params[:package])
          .report_for(params[:id])
      else
        Dashboard.new(app: @app, range: range).send(params[:id])
      end

    resolve_partial

    if params[:package].present?
      render turbo_stream: [
               turbo_stream.replace(
                 "dashboard_#{params[:id]}",
                 partial: resolve_partial[:type],
                 locals: {
                   app: @app,
                   props: @dashboard
                 }
               )
             ]
    else
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
  end

  private

  def resolve_partial
    @partial_data = chart_data[params[:id].to_sym]
  end

  def chart_data
    {
      app_packages: {
        label: I18n.t('dashboard.user_country'),
        type: 'app_packages'
      },
      first_response_time: {
        type: 'count',
        label: I18n.t('dashboard.response_avg'),
        append_label: 'Hrs'
      },
      opened_conversations: {
        type: 'count',
        label: I18n.t('dashboard.new_conversations')
      },
      solved_conversations: {
        type: 'count',
        label: I18n.t('dashboard.resolutions'),
        append_label: ''
      },
      incoming_messages: {
        type: 'count',
        label: I18n.t('dashboard.incoming_messages')
      },
      visits: {
        type: 'heatMap'
      },
      browser: {
        type: 'pie',
        label: I18n.t('dashboard.browser')
      },
      lead_os: {
        type: 'pie',
        label: I18n.t('dashboard.lead_os')
      },
      user_os: {
        type: 'pie',
        label: I18n.t('dashboard.user_os')
      },
      user_country: {
        type: 'pie',
        label: I18n.t('dashboard.user_country')
      }
    }
  end
end
