class Audit < ApplicationRecord
  belongs_to :agent
  belongs_to :app, optional: true
  belongs_to :auditable, polymorphic: true
  include UnionScope

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

  def auditable_name
    auditable.try(:id)
  end

  def auditable_link
    u = case auditable_type
        when "AppUser"
          "/users/#{auditable.id}"
        when "Conversation"
          "/conversations/#{auditable.key}"
        when "Agent"
          "/agents/#{auditable.id}"
        end
    "[#{auditable_name}](/apps/#{@app.key}#{u})"
  end

  def agent_email
    u = "/agents/#{agent.id}"
    "[#{agent.try(:email)}](/apps/#{@app.key}#{u})"
  end

  def serialize_properties(app = nil)
    @app = app ||= auditable.app.key
    as_json(methods: %i[id agent_name auditable_name action created_at sdata])
      .merge(
        auditable_link: auditable_link,
        agent_email: agent_email
      )
  end

  def sdata
    data&.except(:updated_at)&.to_json
  end
end
