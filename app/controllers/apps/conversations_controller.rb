class Apps::ConversationsController < ApplicationController
	before_action :find_app

	def index

		@conversations = @app.conversations
													.includes(:main_participant)
													.page(params[:page]).per(10)


		if params[:page]
			render turbo_stream: [
				turbo_stream.append(
					"conversation-list", 
					partial: "apps/conversations/conversation", 
					collection: @conversations,
				),

				turbo_stream.replace(
					"conversation-list-pagination", 
					partial: "apps/conversations/pagination" 
				),
			] 
		end

	end


	def show

		@conversation = @app.conversations.find_by(key: params[:id])

		@collection = @conversation.messages
			.order("id desc")
			.page(params[:page])
			.per(params[:per] || 2)

		render turbo_stream: [
			turbo_stream.replace(
				"conversation",
				template: "apps/conversations/show", 
				locals: { app: @app, conversation: @conversation },
			),
		] unless params[:page]

		render turbo_stream: [
			turbo_stream.append(
				"messages-list", 
				partial: "apps/conversations/messages" 
			),
		] if params[:page]

	end
end
