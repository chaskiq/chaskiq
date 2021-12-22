module PermissionsService
  def self.get(name)
    PERMISSION_MANIFEST[name]
  end

  def self.allowed_access_to?(name, section)
    get(name)[:write_access].include?(section)
  end
end
