# frozen_string_literal: true
# This migration comes from gutentag (originally 2)

superclass = ActiveRecord::VERSION::MAJOR < 5 ?
  ActiveRecord::Migration : ActiveRecord::Migration[4.2]
class GutentagCacheCounter < superclass
  def up
    add_column :gutentag_tags, :taggings_count, :integer, :default => 0
    add_index  :gutentag_tags, :taggings_count

    Gutentag::Tag.reset_column_information
    Gutentag::Tag.pluck(:id).each do |tag_id|
      Gutentag::Tag.reset_counters tag_id, :taggings
    end
  end

  def down
    remove_column :gutentag_tags, :taggings_count
  end
end
