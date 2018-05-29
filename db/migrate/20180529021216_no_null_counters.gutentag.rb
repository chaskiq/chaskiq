# frozen_string_literal: true
# This migration comes from gutentag (originally 3)

superclass = ActiveRecord::VERSION::MAJOR < 5 ?
  ActiveRecord::Migration : ActiveRecord::Migration[4.2]
class NoNullCounters < superclass
  def up
    change_column :gutentag_tags, :taggings_count, :integer,
      :default => 0,
      :null    => false
  end

  def down
    change_column :gutentag_tags, :taggings_count, :integer,
      :default => 0,
      :null    => true
  end
end
