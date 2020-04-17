class ChangeOauthApplicationsConstraint < ActiveRecord::Migration[6.0]
  def change
    change_column :oauth_applications, :redirect_uri, :string, :null => true
  end
end
