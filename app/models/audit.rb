class Audit < ApplicationRecord
  belongs_to :agent
  belongs_to :auditable, polymorphic: true

  AUDITABLE_ACTIONS = %i[
    agent_log_in
    agent_log_out
    start_conversation
    close_conversation
    prioritize_conversation
    assign_conversation
  ].freeze
end
