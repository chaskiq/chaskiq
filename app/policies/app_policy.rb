class AppPolicy < ActionPolicy::Base
  authorize :user
  authorize :role, optional: true
  authorize :app, optional: true

  def index?
    # allow everyone to perform "index" activity on posts
    true
  end

  %w[
    all
    user_state
    platform
    apps_create_new_app
    settings_app_settings
    app_packages
    help_center
    platform
    segments
    reports
    settings
    conversations_customize
    conversations
    customize_inbox
    customize_home_apps
    platform_segments
    users
    dashboard
    campaigns
    routing_bots
    reports
    settings
    messenger_settings
    outgoing_webhooks
    oauth_applications
    api_access
    team
  ].each do |namespace|
    %w[manage read write].each do |verb|
      define_method "can_#{verb}_#{namespace}?" do |*_my_arg|
        @role ||= find_role_by_resource
        return @role if @role == true

        PermissionsService.allowed_access_to?(@role.role, namespace, verb)
      end
    end
  end

  def can_manage_profile?
    can_manage_team? || @record == @user
  end

  def find_role_by_resource
    if @record.is_a?(App)
      return true if @record.owner_id == @user.id

      @record.roles.find_by(agent_id: @user.id)
    elsif @record.respond_to?(:app)
      return true if @record.app.owner_id == @user.id

      @record.app.roles.find_by(agent_id: @user.id)
    elsif @app.present?
      return true if @app.owner_id == @user.id

      @app.roles.find_by(agent_id: @user.id)
    end
  end

  def show?
    record.owner_id == user.id || record.roles.where(
      agent_id: user.id
    ).any?
  end

  def agent_only?
    user.is_a?(Agent)
  end

  def invite_user?
    record.owner_id == user.id || record.roles.where(
      agent_id: user.id
    ).tagged_with("manage").any?
  end

  def create_app?
    user.can_create_apps?
  end

  def manage?
    record.owner_id == user.id || record.roles.where(
      agent_id: user.id
    ).tagged_with("manage").any?
  end

  def update_agent?
    role.app.owner_id == user.id ||
      role.agent.id == record.id ||
      role.access_list.include?("manage")
  end

  def update_agent_role?
    role.app.owner_id == user.id ||
      role.access_list.include?("manage") ||
      role.access_list.include?("admin")
  end

  def destroy_agent_role?
    role.app.owner_id == user.id ||
      role.access_list.include?("manage") ||
      role.access_list.include?("admin")
  end

  def update?
    # here we can access our context and record
    user.admin? || (user.id == record.user_id)
  end
end
