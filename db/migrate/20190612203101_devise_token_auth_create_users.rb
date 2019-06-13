class DeviseTokenAuthCreateUsers < ActiveRecord::Migration[6.0]
  def change


    ## Required
    add_column :users, :provider, :string, :null => false, :default => "email"
    add_column :users, :uid, :string, :null => false, :default => ""    
    add_column :users, :tokens, :json
    
    ## User Info
    #t.string :name
    #t.string :nickname
    #t.string :image
    #t.string :email

    # ADD ANOTHER MIGRATION TO RUN THIS
    #add_index :users, [:uid, :provider],     unique: true
  end

end




