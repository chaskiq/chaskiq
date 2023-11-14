class Apps::TranslationsController < ApplicationController
  before_action :find_app

  def new
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    flash[:notice] = "success!"
  end

  def update
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    lang = params[:app][:new_language]
    lang_params = {
      "greetings_#{lang}": "--",
      "intro_#{lang}": "--",
      "tagline_#{lang}": "--"
    }
    @app.update(lang_params)
    @app.reload

    render turbo_stream: [
      turbo_stream.replace(
        "translations_table",
        partial: "apps/messenger/forms/translations_table"
      ),
      turbo_stream.update("modal")
    ] and return
  end

  def destroy
    authorize! @app, to: :can_write_app_settings?, with: AppPolicy, context: {
      user: current_agent
    }

    lang = params[:id]
    lang_params = {
      "greetings_#{lang}": nil,
      "intro_#{lang}": nil,
      "tagline_#{lang}": nil
    }

    @app.update(lang_params)
    @app.reload

    render turbo_stream: [
      turbo_stream.replace(
        "translations_table",
        partial: "apps/messenger/forms/translations_table"
      ),
      turbo_stream.update("modal")
    ] and return
  end
end
