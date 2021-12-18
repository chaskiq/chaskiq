# frozen_string_literal: true

module AuditableBehavior
  extend ActiveSupport::Concern

  included do
    has_many :audits, as: :auditable, dependent: :destroy_async do
      def log(action:, user:, data: nil, ip: nil)
        create(agent: user, action: action, data: data, ip: ip)
      end
    end
  end

  def log_async(action:, user:, data: nil, ip: nil)
    # TODO: permitted enabled actions
    AuditJob.perform_later(model: self, user: user, action: action, data: data, ip: ip) if ENV["ENABLED_AUDITS"] == "true"
  end
end
