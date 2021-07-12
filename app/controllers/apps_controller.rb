class AppsController < ApplicationController
  def show
    @app = App.find_by(key: params[:id])
  end

  def new
    @app = current_agent.apps.new
  end

  def create
    @app = current_agent.apps.create(params[:app].permit!)
    @app.owner = current_agent
    @app.save
    redirect_to app_segments_path(@app.key) and return if @app.errors.blank?

    render turbo_stream: [
      turbo_stream.replace(
        "app_form",
        partial: "form",
        locals: { app: @app }
      )
    ]
  end
end
