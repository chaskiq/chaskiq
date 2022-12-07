class ContactMergerJob < ApplicationJob
  queue_as :default

  def perform(app_id:, from:, to:)
    app = App.find(app_id)
    app.merge_contact(from: from, to: to)
  end
end
