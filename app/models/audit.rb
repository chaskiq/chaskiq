class Audit < ApplicationRecord
  belongs_to :agent
  belongs_to :app
  belongs_to :auditable, polymorphic: true

  AUDITABLE_ACTIONS = %i[
    agent_log_in
    agent_log_out
    start_conversation
    close_conversation
    prioritize_conversation
    assign_conversation
  ].freeze

  before_validation :attach_app

  def attach_app
    self.app_id = auditable.app_id if auditable.respond_to?(:app_id)
  end

  def agent_name
    agent.try(:display_name).to_s || "--"
  end

  def agent_email
    agent.try(:email).to_s
  end

  def auditable_name
    auditable.try(:id)
  end

  def serialize_properties
    as_json(methods: %i[id agent_name auditable_name action agent_email created_at])
  end
end
