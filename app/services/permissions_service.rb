module PermissionsService
  def self.get(name)
    PERMISSION_MANIFEST[name]
    # YAML.safe_load(
    #  File.open(Rails.root.join("config/permissions.yml"))
    # ).with_indifferent_access.freeze[name]
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
