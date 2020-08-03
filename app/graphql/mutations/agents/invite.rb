# frozen_string_literal: true

module Mutations
  module Agents
    class Invite < Mutations::BaseMutation
      field :agent, Types::AgentType, null: false
      argument :app_key, String, required: true
      argument :email, String, required: true

      def resolve(app_key:, email:)
        app = current_user.apps.find_by(key: app_key)

        authorize! app, to: :invite_user?, with: AppPolicy

        agent = app.agents.find_by(email: email)

        if agent.blank?
          agent = Agent.invite!(email: email)
          role = app.roles.find_or_initialize_by(agent_id: agent.id)
          role.save
        else
          agent.deliver_invitation
        end

        { agent: agent }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
