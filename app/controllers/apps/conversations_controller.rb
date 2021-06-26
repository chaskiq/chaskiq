class Apps::ConversationsController < ApplicationController
	before_action :find_app

	def index

		@conversations = @app.conversations
													.includes(:main_participant)
													.page(params[:page]).per(10)

		if request.headers['Turbo-Frame'].present?
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
		else
			#format.html #{ redirect_to "/" }
			render 'index'
		end										
	end


	def show

		@conversation = @app.conversations.find_by(key: params[:id])

		@conversations = @app.conversations
		.includes(:main_participant)
		.page(params[:page]).per(10)

=begin
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
=end

		if request.headers['Turbo-Frame'].present?
			turbo_stream.replace(
				"conversation",
				template: "apps/conversations/show", 
				locals: { app: @app, conversation: @conversation },
			)
		else
			# use a lazy frame on index template to avoid this call
			@collection = @conversation.messages
			.order("id desc")
			.page(params[:page])
			.per(params[:per] || 2)

			render 'index' 
		end	

	end
end
