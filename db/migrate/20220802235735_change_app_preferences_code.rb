class ChangeAppPreferencesCode < ActiveRecord::Migration[7.0]
  def change
    App.find_each do |app|
      if app.preferences.is_a?(String)
        app.update(preferences: JSON.parse(app.preferences))
      else
      end
    end
  end
end
