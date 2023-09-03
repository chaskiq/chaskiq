class AddVersionToPlugin < ActiveRecord::Migration[7.0]
  def change
    add_column :plugins, :version, :string
  end
end
