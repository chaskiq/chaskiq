class BotTask < ApplicationRecord
  belongs_to :app

  def segments
    self.predicates
  end

  def segments=(data)
    self.predicates=(data)
  end
end
