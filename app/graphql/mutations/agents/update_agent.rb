# frozen_string_literal: true

module Mutations
  module Agents
    class UpdateAgent < Mutations::BaseMutation
      field :agent, Types::AgentType, null: false
      argument :app_key, String, required: true
      argument :params, Types::AnyType, required: true
      argument :email, String, required: true

      def resolve(app_key:, email:, params:)
        app = current_user.apps.find_by(key: app_key)
        agent = app.agents.find_by(email:) # , name: 'John Doe')

        authorize! agent,
                   to: :can_manage_profile?,
                   with: AppPolicy,
                   context: {
                     app:
                   }

        data = params.permit(Agent.editable_attributes)

        # data.merge!({avatar: avatar}) if avatar.present?

        agent.update(data)
        track_resource_event(agent, :agent_update, agent.saved_changes, app.id) if agent.errors.blank?

        { agent: }
      end
    end
  end
end
