# frozen_string_literal: true

module Mutations
  module Agents
    class UpdateAgentRole < Mutations::BaseMutation
      field :agent, Types::RoleType, null: false
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :id, String, required: true

      def resolve(app_key:, id:, params:)
        app = current_user.apps.find_by(key: app_key)

        role = app.roles.find_by(agent_id: id)

        authorize! role, to: :can_manage_team?, with: AppPolicy, context: {
          app: app
        }

        agent = role&.agent # , name: 'John Doe')

        data = params.permit(Agent.editable_attributes)

        # role.update(data)
        agent.update(data)

        role.update(role: params[:role]) if params[:role].present?
        track_resource_event(role, :agent_role_update, role.saved_changes, app.id) if role.errors.blank?

        if agent.errors.blank?
          changes = agent.saved_changes
          changes.merge!(role.saved_changes) if params[:role].present?
          track_resource_event(agent, :agent_update, changes, app.id)
        end

        # agent.update(name: params[:name]) if params[:name].present?
        { agent: role }
      end
    end
  end
end
