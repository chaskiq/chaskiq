class Apps::TranslationsController < ApplicationController

  before_action :find_app

  def new
    flash[:notice] = "success!"
  end

  def update
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
