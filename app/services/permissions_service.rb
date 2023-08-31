module PermissionsService
  def self.get(name)
    PERMISSION_MANIFEST[name]
  end

  def self.allowed_access_to?(role_name, section, verb = :read)
    return nil if role_name.blank?

    get(role_name)[:manage]&.include?("all") ||
      get(role_name)[:manage]&.include?(section) ||
      get(role_name)[verb]&.include?(section)
  end

  def self.list
    PERMISSION_MANIFEST
  end
end
