# frozen_string_literal: true

module AuditableBehavior
  extend ActiveSupport::Concern

  included do
    has_many :audits, as: :auditable, dependent: :destroy_async do
      def log(action:, user:, data: nil, ip: nil, app_id: nil)
        create(agent: user, action: action, data: data, ip: ip, app_id: app_id)
      end
    end
  end

  def log_async(action:, user:, data: nil, ip: nil, app_id: nil)
    # TODO: permitted enabled actions
    return unless ENV["ENABLED_AUDITS"] == "true"

    AuditJob.perform_later(
      model: self,
      user: user,
      action: action,
      data: data,
      ip: ip,
      app_id: app_id
    )
  end
end
