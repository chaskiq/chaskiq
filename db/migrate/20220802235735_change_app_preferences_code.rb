class ChangeAppPreferencesCode < ActiveRecord::Migration[7.0]
  def up

    change_column_default :apps, :preferences, {} 

    App.find_each do |app|
      if app.preferences.is_a?(String)
        app.update(preferences: JSON.parse(app.preferences))
      else
      end
    end
  end

  def down 
    change_column_default :apps, :preferences, "{}"
  end
end
