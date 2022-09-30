class VisitorCleanerJob < ApplicationJob
  queue_as :default

  def perform(*args)
    days_to_remove = 5.days.ago
    Visitor.where(last_visited_at: nil).where('updated_at <=?', days_to_remove).delete_all
    Visitor.where('last_visited_at <=?', days_to_remove).delete_all
  end
end
