class QuickReply < ApplicationRecord
  include GlobalizeAccessors
  belongs_to :app
  translates :content
  globalize_accessors attributes: %i[content]

  def self.ransackable_attributes(auth_object = nil)
    ["app_id", "created_at", "id", "title", "content", "updated_at"]
  end

end
