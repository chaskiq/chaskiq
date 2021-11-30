# frozen_string_literal: true

module AuditableBehavior
  extend ActiveSupport::Concern

  included do
    has_many :audits, as: :auditable, dependent: :destroy_async do
      def log(action:, user:, data: nil)
        create(agent: user, action: action, data: data)
      end
    end
  end

  def log_async(action:, user:, data: nil)
    # TODO: permitted enabled actions
    AuditJob.perform_later(model: self, user: user, action: action, data: data) if ENV["ENABLED_AUDITS"] == "true"
  end
end
