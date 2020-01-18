# frozen_string_literal: true

class HookMessageReceiverJob < ApplicationJob
  queue_as :default
  def perform(id, params)
    pkg = AppPackageIntegration.find(id)
    pkg.process_event(params)
  end
end
