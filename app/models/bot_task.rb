class BotTask < ApplicationRecord
  belongs_to :app
  has_many :bot_paths
end
