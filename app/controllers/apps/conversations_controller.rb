class Apps::ConversationsController < ApplicationController
	before_action :find_app

	def index

		@conversations = @app.conversations.includes(:main_participant)
													.page(params[:page]).per(20)
	end


	def show

		@conversation = @app.conversations.find_by(key: params[:id])

		@collection = @conversation.messages
			.order("id desc")
			.page(params[:page])
			.per(params[:per] || 20)

		render turbo_stream: [
			turbo_stream.replace(
				"conversation", 
				template: "apps/conversations/show", 
				locals: { app: @app, conversation: @conversation },
			),
		]

	end
end
