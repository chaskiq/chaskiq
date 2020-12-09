# frozen_string_literal: true

module Mutations
  module Agents
    class UpdateAgentRole < Mutations::BaseMutation
      field :agent, Types::AgentType, null: false
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :id, String, required: true

      def resolve(app_key:, id:, params:)
        app = current_user.apps.find_by(key: app_key)

        role = app.roles.find_by(id: id)

        agent = role&.agent # , name: 'John Doe')

        authorize! agent, to: :update_agent?, with: AppPolicy, context: {
          role: app.roles.find_by(agent_id: current_user.id),
        }

        data = params.permit(
          :name,
          :avatar,
          :lang,
          :first_name,
          :last_name,
          :country,
          :country_code,
          :region,
          :region_code,
          :enable_deliveries,
          :available,
          :access_list
        )

        agent.update(data)

        role.update(access_list: params[:access_list])

        { agent: agent }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
