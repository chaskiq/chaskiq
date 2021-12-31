class AddRolesFromAccessList < ActiveRecord::Migration[6.1]
  def up
    Role.find_each do |r|
      list = r.access_list
      role = nil
      if list.blank?
        puts "agent role default"
        role = "agent"
      elsif list.include?("manage")
        puts "manage role detected"
        role = "manage"
      elsif list.include?("admin")
        puts "admin role detected"
        role = "admin"
      else
        role = "agent"
        puts "agent role default"
      end

      r.update_column(:role, role)
    end
  end

  def down
    
  end
end
