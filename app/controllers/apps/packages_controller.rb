class Apps::PackagesController < ApplicationController
  before_action :find_app, except: %i[content submit process_initialize]
  before_action :find_app_for_resource, only: %i[content submit process_initialize]
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
      flash.now[:notice] = t("status_messages.updated_success")
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
      flash.now[:notice] = t("status_messages.updated_success")
      redirect_to app_integrations_path(@app.key, kind: :yours)
    else
      render "edit", status: :unprocessable_entity
    end
  end

  def destroy
    @app_package = current_agent.app_packages.find(params[:id])
    if @app_package.destroy
      flash.now[:notice] = t("status_messages.deleted_success")
      redirect_to app_integrations_path(@app.key, kind: :yours)
    else
      render "new", status: :unprocessable_entity
    end
  end

  def capabilities
    authorize! @app, to: :show?, with: AppPolicy, context: {
      user: current_agent
    }

    @location = params[:kind]
    @category = params[:category]
    @conversation_key = params[:conversation_key]
    @bot_id = params[:bot_id]
    @bot_step_id = params[:bot_step_id]
    @bot_path_id = params[:bot_path_id]

    @packages = @app.app_package_integrations
                    .joins(:app_package)
                    .where(
                      app_package_id: @app.app_packages.tagged_with(params[:kind], on: "capabilities")
                    ).order("app_packages.name desc")

    render "apps/packages/fixed_capabilities", layout: false and return if @location == "fixed_sidebar"

    render "apps/packages/capabilities", layout: false
  end

  def open_sidebar
    render "apps/packages/open_sidebar", layout: false and return
  end

  def configure
    @package = get_app_package
    @package_name = params[:id]
    @conversation_key = params[:conversation_key] || params.dig(:ctx, :conversation_key)
    @message_key = params[:message_key] || params.dig(:ctx, :message_key)

    @category = params[:category] || params.dig(:ctx, :category)
    @location = params[:location] || params.dig(:ctx, :location)

    @bot_id = params[:bot_id] || params.dig(:ctx, :bot_id)
    @bot_step_id = params[:bot_step_id] || params.dig(:ctx, :bot_step_id)
    @bot_path_id = params[:bot_path_id] || params.dig(:ctx, :bot_path_id)

    @blocks = @package.call_hook({
                                   kind: "configure",
                                   ctx: {
                                     conversation_key: @conversation_key,
                                     message_key: @message_key,
                                     lang: I18n.locale,
                                     current_user: @user,
                                     field: params.dig(:ctx, :field),
                                     values: params.dig(:ctx, :values)
                                   }.with_indifferent_access
                                 })

    # Rails.logger.debug @blocks
    # Rails.logger.debug @blocks[:kind]
    case @blocks[:kind]
    when "configure", nil
      @blocks[:kind] = "configure" if @blocks[:kind].blank?
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
    @message_key = params[:message_key] || params.dig(:ctx, :message_key)

    @location = params[:location] || params[:ctx][:location]
    @blocks = @package.call_hook({
                                   kind: "content",
                                   ctx: {
                                     location: @location,
                                     values: params[:values],
                                     lang: I18n.locale,
                                     current_user: @user,
                                     message_key: @message_key,
                                     conversation_key: @conversation_key
                                   }.with_indifferent_access
                                 })
    @identifier = if @location == "fixed_sidebar"
                    "fixed-app-packages"
                  else
                    "#{@location}-#{@conversation_key}-#{@package_name}"
                  end

    render template: "apps/packages/content", layout: false
  end

  def submit
    @package = get_app_package
    @package_name = params[:id]
    @conversation_key = params[:ctx][:conversation_key]
    @message_key = params[:ctx][:message_key]
    @location = params.dig(:ctx, :location)
    @blocks = @package.call_hook({
                                   kind: "submit",
                                   ctx: {
                                     # values: params[:values],
                                     location: @location,
                                     lang: I18n.locale,
                                     current_user: @app.app_users.first,
                                     # current_user: current_agent,
                                     field: params[:ctx][:field],
                                     values: params[:ctx][:values].permit!,
                                     message_key: @message_key,
                                     conversation_key: @conversation_key
                                   }.with_indifferent_access
                                 })

    @identifier = if @location == "fixed_sidebar"
                    "fixed_packages"
                  elsif params[:ctx][:frame]
                    params[:ctx][:frame]
                  else
                    "#{@location}-#{@message_key}-#{@package_name}"
                  end
    render template: "apps/packages/content", layout: false
  end

  def process_initialize
    @location = params.dig(:ctx, :location) || params[:location]

    @bot_id = params.dig(:ctx, :bot_id)
    @bot_step_id = params.dig(:ctx, :bot_step_id)
    @bot_path_id = params.dig(:ctx, :bot_path_id)

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
        turbo_stream.update("modal")
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
        turbo_stream.update("modal")
      ]

    when "conversations", "bots"

      # TODO: esto es el paso final, pero en realidad deberiasmo
      # crear un paso mas del form y aceptar y de ahi ejecutar esto
      @conversation = @app.conversations.find_by(key: @conversation_key)

      @blocks[:kind] = "submit" if @blocks[:kind].blank?

      @blocks = @blocks.with_indifferent_access

      @submit = true
      @method = insert_app_package_path(@app.key, @package_name, namespace: @location)
      payload = {
        "blocks" => @blocks,
        "conversation_key" => @conversation_key,
        "bot_id" => @bot_id,
        "bot_step_id" => @bot_step_id,
        "bot_path_id" => @bot_path_id,
        "category" => params.dig(:ctx, :category) || params[:category]
      }
      @token = CHASKIQ_VERIFIER.generate(payload, purpose: :app_packages)

      render turbo_stream: turbo_stream.replace(
        "modal",
        template: "apps/packages/configure"
      ), status: :accepted and return

    when "botsss"
      @category = params.dig(:ctx, :category) || params[:category]
      @bot = @app.bot_tasks.find(@bot_id)

      render "apps/bots/editor/package"
    end
  end

  def insert
    @package_name = params[:id]

    payload = CHASKIQ_VERIFIER.verify(params[:token], purpose: :app_packages)

    case params[:namespace]
    when "conversations"

      @conversation = @app.conversations.find_by(key: payload["conversation_key"])
      author = current_agent

      controls = {
        app_package: @package_name,
        schema: payload["blocks"]["definitions"],
        type: "app_package",
        values: payload["blocks"]["values"]
      }.with_indifferent_access

      @message = @conversation.add_message(
        from: author,
        controls: controls
      )

      flash.now[:notice] = t("status_messages.created_success")

      render turbo_stream: [
        turbo_stream.update("modal"),
        flash_stream
      ]
    when "bots"
      @category = payload["category"]
      @bot = @app.bot_tasks.find(payload["bot_id"])
      @bot_id = payload["bot_id"]
      @bot_path_id = payload["bot_path_id"]
      @bot_step_id = payload["bot_step_id"]
      @blocks = payload["blocks"]

      render "apps/bots/editor/package"
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

  def find_app_for_resource
    if request.referer.include?("/messenger/")
      @app = App.find_by(key: params[:app_id])
      @user = @app.app_users.find_by(session_id: session[:messenger_session_id])
    else
      @app = current_agent.apps.find_by(key: params[:app_id])
      @user = current_agent
    end
  end
end
