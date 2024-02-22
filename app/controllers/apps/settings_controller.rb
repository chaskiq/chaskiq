class Apps::SettingsController < ApplicationController
  before_action :find_app

  def show
    authorize! @app, to: :can_manage_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }
  end

  def update
    authorize! @app, to: :can_manage_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    request_params = params.require(:app).permit(
      :domain_url,
      :name,
      :logo,
      :domain_url,
      :outgoing_email_domain,
      :tagline,
      :gather_social_data,
      :register_visits,
      user_tasks_settings: [:delay],
      lead_tasks_settings: %i[delay routing share_typical_time share_typical_time assignee email_requirement]
    )

    @app.update(request_params)

    redirect_to params[:redirect] || app_settings_path(@app.key)
  end
end
