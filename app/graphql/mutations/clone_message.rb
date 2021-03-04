# frozen_string_literal: true

module Mutations
	class CloneMessage < Mutations::BaseMutation
		field :errors, Types::JsonType, null: false
		field :id, String, null: true
		argument :app_key, String, required: true
		argument :id, String, required: true

		def resolve(app_key:, id:)
			app = current_user.apps.find_by(key: app_key)
			message = app.messages.find(id)

			new_message = message.dup
			new_message.name = "#{new_message.name} (copy)"
			new_message.state = "disabled"
			new_message.save
			{ id: id, errors: new_message.errors }
		end
	end
end
