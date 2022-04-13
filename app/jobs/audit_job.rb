# frozen_string_literal: true

class AuditJob < ApplicationJob
  queue_as :default

  def perform(model:, user:, action:, data: nil, ip: nil, app_id: nil)
    model.audits.log(
      action:,
      user:,
      data:,
      ip:,
      app_id:
    )
  end
end
