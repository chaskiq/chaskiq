class AppsController < ApplicationController
  def show
    @app = App.find_by(key: params[:id])
    @actions = set_actions
  end

  def new
    @app = current_agent.apps.new
  end

  def create
    permitted_params = params.require(:app).permit(:name, :domain_url, :tagline)
    @app = current_agent.apps.create(permitted_params)
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

  def set_actions
    [
      {
        title: I18n.t("navigator.conversations"),
        href: "/apps/#{@app.key}/conversations",
        icon: "ConversationChatIcon",
        icon_foreground: "text-sky-700",
        icon_background: "bg-sky-50",
        allowed: allowed_access_to(@app, "conversations")
      },
      {
        title: "Reports",
        href: "/apps/#{@app.key}/reports",
        icon: "ChartsIcons",
        icon_foreground: "text-purple-700",
        icon_background: "bg-purple-50",
        allowed: allowed_access_to(@app, "reports")
      },
      {
        title: I18n.t("navigator.childs.messenger_settings"),
        href: "/apps/#{@app.key}/messenger",
        icon: "AppSettingsIcon",
        icon_foreground: "text-teal-700",
        icon_background: "bg-teal-50",
        allowed: allowed_access_to(@app, "messenger_settings")
      },
      {
        title: I18n.t("navigator.childs.app_settings"),
        href: "/apps/#{@app.key}/settings",
        icon: "SettingsIcon",
        icon_foreground: "text-teal-700",
        icon_background: "bg-teal-50",
        allowed: allowed_access_to(@app, "app_settings")
      },
      {
        title: I18n.t("navigator.campaigns"),
        href: "/apps/#{@app.key}/campaigns",
        icon: "CampaignsIcon",
        icon_foreground: "text-sky-700",
        icon_background: "bg-sky-50",
        allowed: allowed_access_to(@app, "campaigns")
      },
      {
        title: I18n.t("dashboard.guides"),
        external_link: "https://dev.chaskiq.io",
        icon: "HelpCenterIcon",
        icon_foreground: "text-sky-700",
        icon_background: "bg-sky-50",
        text: I18n.t("navigator.help_center"),
        allowed: true
      }
    ]
  end

  def allowed_access_to(app, section)
    # Your implementation of allowedAccessTo goes here
    # Return a boolean value depending on the access permissions
  end

  def render_icon(icon_name)
    # Depending on how you handle icons in your Rails app.
    # This can be a simple image_tag or more complex logic if you use SVG icons or another system.
    image_tag("#{icon_name}.png", class: "h-6 w-6", "aria-hidden": "true")
  end
end
