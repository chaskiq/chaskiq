class Apps::ConversationMessagesController < ApplicationController
	before_action :find_app

	def index
		@conversation = @app.conversations.find_by(key: params[:conversation_id])
		@messages = @conversation.messages
															.order("id desc")
															.page(params[:page])
															.per(params[:per] || 2)


		render turbo_stream: [
				turbo_stream.replace(
				"conversation-messages", 
				template: "apps/conversation_messages/index",
			),
		] unless params[:page]

		render turbo_stream: [
			turbo_stream.prepend(
				"conversation-messages-list", 
				partial: "apps/conversation_messages/messages",
				collection: @messages 
			),
			turbo_stream.replace(
				"conversation-messages-list-pagination", 
				partial: "apps/conversation_messages/pagination" 
			),
		] if params[:page]
	end

	def create
		conversation = @app.conversations.find_by(key: params[:conversation_id])
		#author = @app.agents.where("agents.email =?", current_agent.email).first
		message = params[:conversation_message]
		options = {
			from: current_agent,
			message: {
				html_content: message["html"],
				serialized_content: message["serialized"],
				text_content: message["text"] || ActionController::Base.helpers.strip_tags(message["html"])
			}
		}

		@message = conversation.add_message(options)

		render turbo_stream: turbo_stream.append( "conversation-messages-list", 
																								partial: "apps/conversation_messages/part",
																								locals: {message: @message}
																							)

	end
end
