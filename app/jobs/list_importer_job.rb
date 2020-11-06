# frozen_string_literal: true

class ListImporterJob < ApplicationJob
  queue_as :default

  # send to all list with state passive & subscribed
  def perform(blob_url:, app_id:, agent_id:, type:)
    ListImporter.import( 
      blob_url,  
      params: { 
          app_id: app_id,
          agent_id: agent_id,
          type: type
      } 
    )
  end
end
