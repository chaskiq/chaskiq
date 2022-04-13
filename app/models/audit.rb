class Audit < ApplicationRecord
  belongs_to :agent
  belongs_to :app, optional: true
  belongs_to :auditable, polymorphic: true, optional: true
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
    name, path = case auditable_type
                 when "AppUser"
                   [auditable.display_name, "/users/#{auditable.id}"]
                 when "Conversation"
                   [auditable.key, "/conversations/#{auditable.key}"]
                 when "Agent"
                   [auditable.display_name, "/agents/#{auditable.id}"]
                 end
    "[#{name}](/apps/#{@app.key}#{path})"
  end

  def agent_email
    u = "/agents/#{agent.id}"
    "[#{agent.try(:email)}](/apps/#{@app.key}#{u})"
  end

  def serialize_properties(app = nil)
    @app = app ||= auditable.app.key
    as_json(methods: %i[id agent_name auditable_name action created_at sdata])
      .merge(
        auditable_link:,
        agent_email:
      )
  end

  def sdata
    data&.except(:updated_at)&.to_json
  end
end
