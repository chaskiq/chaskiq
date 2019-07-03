class AssignmentRule < ApplicationRecord
  belongs_to :app
  belongs_to :agent
  store_accessor :conditions

end
