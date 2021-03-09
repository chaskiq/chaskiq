# frozen_string_literal: true

module Mutations
  module Agents
    class UpdateAgent < Mutations::BaseMutation
      field :agent, Types::AgentType, null: false
      argument :app_key, String, required: true
      argument :params, Types::JsonType, required: true
      argument :email, String, required: true

      def resolve(app_key:, email:, params:)
        app = current_user.apps.find_by(key: app_key)
        agent = app.agents.find_by(email: email) # , name: 'John Doe')

        authorize! agent, to: :update_agent?, with: AppPolicy, context: {
          role: app.roles.find_by(agent_id: current_user.id)
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
          :available
        )

        # data.merge!({avatar: avatar}) if avatar.present?

        agent.update(data)

        { agent: agent }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
