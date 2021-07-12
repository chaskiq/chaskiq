class Apps::SettingsController < ApplicationController
  before_action :find_app

  def update
    request_params = params.require(:app).permit(
      :domain_url,
      :name,
      :domain_url,
      :outgoing_email_domain,
      :tagline,
      :gather_social_data,
      :register_visits
    )
    @app.update(request_params)

    redirect_to app_settings_path(@app.key)
  end
end
