class AppPolicy < ActionPolicy::Base
  authorize :user
  authorize :role, optional: true

  def index?
    # allow everyone to perform "index" activity on posts
    true
  end

  %w[all
     apps_create_new_app
     dashboard
     campaigns
     routing_bots
     help_center
     reports
     settings
     users_archive
     conversations_customize
     conversations
     platform
     apps_create_new_app
     settings_app_settings
     dashboard
     campaigns
     routing_bots
     help_center
     conversations
     platform
     reports
     settings
     conversations
     platform_segments
     users
     dashboard
     campaigns
     routing_bots
     reports
     settings
     settings_messenger_settings
     settings_webhooks
     settings_api_access].each do |namespace|
    %w[manage read write].each do |verb|
      define_method "can_#{verb}_#{namespace}?" do |*_my_arg|
        PermissionsService.allowed_access_to?(@role.role, namespace, verb)
      end
    end
  end

  # def can?
  #   debugger
  #   PermissionsService.allowed_access_to?(@role.role.to_sym, :conversations)
  #   PermissionsService.allowed_access_to?(:admin_only, :conversations)
  # end

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
