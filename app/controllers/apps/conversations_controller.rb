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

	def sidebar

		if params[:q] == 'cancel' 
			render turbo_stream: turbo_stream.replace(
				"conversation-sidebar-packages", 
				partial: "apps/packages/inbox_packages1", locals: {
					ctx: { conversation_key: @conversation.key }
				}
			)
		else
			render turbo_stream: turbo_stream.replace(
				"conversation-sidebar-packages", 
				partial: "apps/packages/inbox_packages", 
			)
		end

	end
end
