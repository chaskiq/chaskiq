# frozen_string_literal: true

class ListImporterJob < ApplicationJob
  queue_as :default

  # send to all list with state passive & subscribed
  def perform(list, file)
    list.import_csv(file)
    File.unlink(file)
  end
end
