class Workflow < ApplicationRecord
  belongs_to :app
  has_many :messages
end
