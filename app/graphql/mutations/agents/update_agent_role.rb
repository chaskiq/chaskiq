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

        agent = role&.agent # , name: 'John Doe')

        authorize! role, to: :can_manage_team?, with: AppPolicy, context: {
          app: app
        }

        data = params.permit(
          :avatar,
          :lang,
          :name,
          :first_name,
          :last_name,
          :country,
          :country_code,
          :region,
          :region_code,
          :enable_deliveries,
          :available,
          # :access_list,
          :address,
          :area_of_expertise,
          :availability,
          :phone_number,
          :specialization,
          :enable_deliveries,
          :available
        )

        # role.update(data)
        agent.update(data)

        role.update(role: params[:role]) if params[:role].present?

        if agent.errors.blank?
          changes = agent.saved_changes
          changes.merge!(role.saved_changes) if params[:role].present?
          track_resource_event(agent, :agent_update, changes, app.id)
        end

        # agent.update(name: params[:name]) if params[:name].present?
        { agent: role }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
