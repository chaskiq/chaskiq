class QuickReply < ApplicationRecord
  belongs_to :app
  translates :content
  globalize_accessors attributes: %i[ content ]
end
