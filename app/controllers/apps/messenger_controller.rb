class Apps::MessengerController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def edit; end

  def update
    flash[:notice] = "success!"

    if @app.update(resource_params)

      if params[:app][:new_language].present?
        render turbo_stream: [
          turbo_stream.replace(
            "translations_table",
            partial: "apps/messenger/forms/translations_table"
          )
        ] and return
      end

      render turbo_stream: [flash_stream]
    else
      render "edit"
    end
  end

  def resource_params
    lang_items = @app.translations.map(&:locale).map do |o|
      [:"greetings_#{o}", :"tagline_#{o}", :"intro_#{o}"]
    end.flatten

    permitted_attrs = [
      :active_messenger,
      :inline_new_conversations,
      :privacy_consent_required,
      :domain_url,
      :reply_time,
      lang_items,
      :email_requirement,
      {
        agent_editor_settings_objects: %i[images attachments giphy link_embeds embeds video_recorder app_packages routing_bots quick_replies bot_triggers divider],
        user_editor_settings_objects: %i[emojis gifs attachments],
        lead_editor_settings_objects: %i[emojis gifs attachments],
        team_schedule_objects_attributes: %i[day from to],
        inbound_settings_objects: %i[enabled users_enabled users_segment visitors_enabled visitors_segment],
        customization_colors_attributes: %i[primary secondary pattern]
      }
    ]

    # .flatten
    params.require(:app).permit(permitted_attrs)
  end
end
