# frozen_string_literal: true
# This migration comes from gutentag (originally 1)

superclass = ActiveRecord::VERSION::MAJOR < 5 ?
  ActiveRecord::Migration : ActiveRecord::Migration[4.2]
class GutentagTables < superclass
  def up
    create_table :gutentag_taggings do |t|
      t.integer :tag_id,        :null => false
      t.integer :taggable_id,   :null => false
      t.string  :taggable_type, :null => false
      t.timestamps :null => false
    end

    add_index :gutentag_taggings, :tag_id
    add_index :gutentag_taggings, %i[ taggable_type taggable_id ]
    add_index :gutentag_taggings, %i[ taggable_type taggable_id tag_id ],
      :unique => true, :name => "unique_taggings"

    create_table :gutentag_tags do |t|
      t.string :name, :null => false
      t.timestamps :null => false
    end

    add_index :gutentag_tags, :name, :unique => true
  end

  def down
    drop_table :gutentag_tags
    drop_table :gutentag_taggings
  end
end
