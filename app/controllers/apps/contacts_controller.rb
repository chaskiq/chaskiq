class Apps::ContactsController < ApplicationController
  before_action :find_app

  def new
    authorize! @app, to: :can_manage_users?, with: AppPolicy

    @app_user = @app.app_users.new(type: AppUser)

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

    case params[:app_user][:type]
    when "AppUser"
      @app_user = @app.add_user(resource_params.merge(additional_validations: true))
    when "Lead"
      @app_user = @app.add_lead(resource_params.merge(additional_validations: true))
    end
  end

  def bulk
    authorize! @app, to: :can_write_users?, with: AppPolicy

    if request.get?
      @contact_uploader = ContactUploader.new(contact_type: "AppUser")
    elsif request.post?

      uploaded_file = params[:contact_uploader][:file]

      blob = ActiveStorage::Blob.create_and_upload!(
        io: uploaded_file.open,
        filename: uploaded_file.original_filename,
        content_type: uploaded_file.content_type
      )

      @contact_uploader = ContactUploader.new(
        contact_type: params[:contact_uploader][:contact_type]
      )

      ListImporterJob.perform_later(
        blob_url: rails_blob_url(blob),
        app_id: @app.id,
        agent_id: current_agent.id,
        type: params[:contact_uploader][:contact_type]
      )

      flash.now[:notice] = "file uploaded"
      render "bulk"
    end
  end

  def resource_params
    params.require(:app_user).permit(:company_name, :name, :email, :phone)
  end
end
