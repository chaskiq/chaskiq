class BotTask < ApplicationRecord
  belongs_to :app

  before_create :defaults

  store_accessor :settings, [ 
    :scheduling
  ]

  def segments
    self.predicates
  end

  def segments=(data)
    self.predicates=(data)
  end


  def defaults
    self.predicates = [] unless self.predicates.present?
  end
end
