# frozen_string_literal: true

class AuditJob < ApplicationJob
  queue_as :default

  def perform(model:, user:, action:, data: nil, ip: nil)
    model.audits.log(
      action: action,
      user: user,
      data: data,
      ip: ip
    )
  end
end
