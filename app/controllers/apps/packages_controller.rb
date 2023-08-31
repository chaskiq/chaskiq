class Apps::PackagesController < ApplicationController
  before_action :find_app

  before_action :set_settings_navigator, only: %i[new create update edit]

  def index; end

  def show; end

  def new
    @app_package = current_agent.app_packages.new
  end

  def edit
    @app_package = current_agent.app_packages.find(params[:id])
  end

  def create
    resource_params = params.require(:app_package).permit(
      :name,
      :description,
      :published,
      :oauth_url,
      :initialize_url,
      :configure_url,
      :submit_url,
      :sheet_url,
      capability_list: []
    )

    @app_package = current_agent.app_packages.create(resource_params)

    if @app_package.errors.blank?
      flash.now[:notice] = "Place was updated!"
      redirect_to app_integrations_path(@app.key, kind: :yours)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def update
    @app_package = current_agent.app_packages.find(params[:id])
    resource_params = params.require(:app_package).permit(
      :name,
      :description,
      :published,
      :oauth_url,
      :initialize_url,
      :configure_url,
      :submit_url,
      :sheet_url,
      capability_list: []
    )

    if @app_package.update(resource_params)
      flash.now[:notice] = "Place was updated!"
      redirect_to app_integrations_path(@app.key, kind: :yours)
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def destroy
    @app_package = current_agent.app_packages.find(params[:id])
    if @app_package.destroy
      flash.now[:notice] = "Place was updated!"
      redirect_to app_integrations_path(@app.key, kind: :yours)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def capabilities
    @location = params[:kind]
    @category = params[:category]
    @conversation_key = params[:conversation_key]

    @packages = @app.app_package_integrations
                    .joins(:app_package)
                    .where(
                      app_package_id: @app.app_packages.tagged_with(params[:kind], on: "capabilities")
                    ).order("app_packages.name desc")
  end

  def configure
    @package = get_app_package
    @package_name = params[:id]
    @conversation_key = params[:conversation_key] || params.dig(:ctx, :conversation_key)

    @category = params[:category] || params.dig(:ctx, :category)
    @location = params[:location] || params.dig(:ctx, :location)

    @blocks = @package.call_hook({
                                   kind: "configure",
                                   ctx: {
                                     lang: I18n.locale,
                                     current_user: current_agent,
                                     field: params.dig(:ctx, :field),
                                     values: params.dig(:ctx, :values)
                                   }.with_indifferent_access
                                 })

    case @blocks[:kind]
    when "configure", nil
      render turbo_stream: turbo_stream.replace(
        "modal",
        template: "apps/packages/configure"
      ), status: :accepted
    when "initialize"
      process_initialize
    end
  end

  def content
    @package = get_app_package
    @package_name = params[:id]
    @conversation_key = params[:conversation_key] || params.dig(:ctx, :conversation_key)

    @blocks = @package.call_hook({
                                   kind: "content",
                                   ctx: {
                                     values: params[:values],
                                     lang: I18n.locale,
                                     current_user: current_agent,
                                     conversation_key: params[:conversation_key]
                                   }.with_indifferent_access
                                 })

    render template: "apps/packages/content", layout: false
  end

  def submit
    @package = get_app_package
    @package_name = params[:id]
    @conversation_key = params[:ctx][:conversation_key]

    @blocks = @package.call_hook({
                                   kind: "submit",
                                   ctx: {
                                     # values: params[:values],
                                     lang: I18n.locale,
                                     current_user: current_agent,
                                     field: params[:ctx][:field],
                                     values: params[:ctx][:values],
                                     conversation_key: params[:ctx][:conversation_key]
                                   }.with_indifferent_access
                                 })

    render template: "apps/packages/content", layout: false
  end

  def process_initialize
    @location = params.dig(:ctx, :location) || params[:location]

    case @location

    when "home"
      @category = params.dig(:ctx, :category) || params[:category]
      resource_name = @category == "visitors" ? :visitor_home_apps : :user_home_apps
      resource = @app.send(resource_name)
      # refactor here
      result_data = resource.blank? ? [package_build_data] : resource << package_build_data

      @app.update(resource_name => result_data)

      @app_packages = @app.send(resource_name)

      render turbo_stream: [
        turbo_stream.replace("home-sortable", partial: "apps/home_packages/sorts"),
        turbo_stream.replace("modal")
      ]

    when "inbox"
      @app.inbox_apps ||= []
      @app.inbox_apps <<  package_build_data
      @app.save

      render turbo_stream: [
        turbo_stream.replace(
          "inbox-sorts",
          partial: "apps/inbox_packages/inbox_sorts"
        ),
        turbo_stream.replace("modal")
      ]

    when "conversations"

      # TODO: esto es el paso final, pero en realidad deberiasmo
      # crear un paso mas del form y aceptar y de ahi ejecutar esto
      @conversation = @app.conversations.find_by(key: @conversation_key)

      author = @app.agents.where("agents.email =?",
                                 current_agent.email).first # if current_user.is_a?(Agent)

      controls = {
        app_package: @package_name,
        schema: @blocks[:definitions],
        type: "app_package"
      }

      @message = @conversation.add_message(
        from: author,
        controls: controls
      )

      flash.now[:notice] = "Package added"

      render turbo_stream: [flash_stream]
    end
  end

  protected

  def package_build_data
    {
      "hooKind" => "initialize",
      definitions: @blocks[:definitions],
      "values" => @blocks[:values],
      "id" => @package.id,
      "name" => @package.app_package.name
    }
  end

  def get_app_package
    @app.app_package_integrations
        .joins(:app_package)
        .find_by("app_packages.name": params[:id])
  end
end
