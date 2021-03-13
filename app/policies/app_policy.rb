class AppPolicy < ActionPolicy::Base
  authorize :user
  authorize :role, optional: true

  def index?
    # allow everyone to perform "index" activity on posts
    true
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
    ).tagged_with('manage').any?
  end

  def create_app?
    user.can_create_apps?
  end

  def manage?
    record.owner_id == user.id || record.roles.where(
      agent_id: user.id
    ).tagged_with('manage').any?
  end

  def update_agent?
    role.app.owner_id == user.id ||
      role.agent.id == record.id ||
      role.access_list.include?('manage')
  end

  def update_agent_role?
    role.app.owner_id == user.id ||
      role.access_list.include?('manage') ||
      role.access_list.include?('admin')
  end

  def update_agent_role?
    role.app.owner_id == user.id ||
      role.access_list.include?('manage') ||
      role.access_list.include?('admin')
  end

  def update?
    # here we can access our context and record
    user.admin? || (user.id == record.user_id)
  end
end
