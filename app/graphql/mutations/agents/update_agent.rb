# frozen_string_literal: true

module Mutations
  module Agents
    class UpdateAgent < Mutations::BaseMutation
      field :agent, Types::AgentType, null: false
      argument :app_key, String, required: true
      argument :email, String, required: true
      argument :name, String, required: true

      def resolve(app_key:, email:, name:)
        app = current_user.apps.find_by(key: app_key)

        agent = app.agents.find_by(email: email) # , name: 'John Doe')

        agent.update(name: name)

        { agent: agent }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
