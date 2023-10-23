class Apps::ContactsController < ApplicationController
  before_action :find_app

  def new
    authorize! @app, to: :can_manage_users?, with: AppPolicy

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace(
            "modal",
            template: "apps/contacts/new",
            locals: { app: @app }
          )
        ]
      end
      format.html # { redirect_to "/" }
    end
  end

  def search
    authorize! @app, to: :can_read_users?, with: AppPolicy

    if Chaskiq::Config.get("SEARCHKICK_ENABLED") == "true" && @app.searchkick_enabled?
      @collection = AppUser.search(
        params[:term],
        fields: %i[name last_name first_name email phone],
        where: { app_id: @app.id }
      )
    else
      query_term = :last_name_or_first_name_or_name_or_email_or_phone_i_cont_any
      @collection = @app.app_users.limit(10).ransack(
        query_term => params[:term]
      ).result
    end
  end

  def show
    authorize! @app, to: :can_read_users?, with: AppPolicy

    @app_user = @app.app_users.find(params[:id])
    @user_data = { id: @app_user.id, lat: @app_user.lat,
                   lng: @app_user.lng, display_name: @app_user.display_name || @app_user.email }

    if params[:sidebar]
      render turbo_stream: [
        turbo_stream.replace(
          "slide-modal",
          partial: "contact"
        )
      ]
    end
  end

  def create
    authorize! @app, to: :can_write_users?, with: AppPolicy

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace(
            "modal",
            template: "apps/contacts/new",
            locals: { app: @app }
          )
        ]
      end
      format.html do
        render :show
      end
    end
  end
end
