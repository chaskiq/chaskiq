class Apps::ContactsController < ApplicationController
  before_action :find_app

  def new
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

  def show
    @app_user = @app.app_users.find(params[:id])

    render turbo_stream: [
      turbo_stream.replace(
        "slide-modal",
        partial: "contact"
      )
    ]
  end

  def create
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
