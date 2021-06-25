class Apps::ConversationMessagesController < ApplicationController
	before_action :find_app

	def index

		@conversation = @app.conversations.find_by(key: params[:conversation_id])

		@messages = @conversation.messages
															.order("id desc")
															.page(params[:page])
															.per(params[:per] || 10)


		render turbo_stream: [
			turbo_stream.replace(
				"conversation-messages", 
				template: "apps/conversation_messages/index",
			),
		] unless params[:page]

		render turbo_stream: [
			turbo_stream.append(
				"conversation-messages", 
				partial: "apps/conversation_messages/messages",
				collection: @messages 
			),
			turbo_stream.replace(
				"conversation-list-pagination", 
				partial: "apps/conversation_messages/pagination" 
			),
		] if params[:page]
	end
end
