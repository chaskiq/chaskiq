# frozen_string_literal: true

class HookMessageReceiverJob < ApplicationJob
  queue_as :default
  def perform(id:, params:)
    pkg = AppPackageIntegration.find(id)
    pkg.message_api_klass.process_event(params, pkg)
  end
end
