class Apps::ConversationsController < ApplicationController
	before_action :find_app

	def index
		@conversations = search_service.search
		@conversations = @conversations
			.includes(:main_participant)
			.page(params[:page]).per(10)

		if request.headers['Turbo-Frame'].present?
				render turbo_stream: [
					turbo_stream.append(
						"conversation-list-#{@app.key}", 
						partial: "apps/conversations/conversation", 
						collection: @conversations,
						locals: {
							app: @app
						}
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

	def search
		@conversations = search_service.search
		@conversations = @conversations
			.includes(:main_participant)
			.page(params[:page]).per(10)

		render turbo_stream: [
			
			turbo_stream.replace(
				"conversation-list-#{@app.key}", 
				partial: "apps/conversations/collection"
			),

			turbo_stream.replace(
				"conversation-list-pagination", 
				partial: "apps/conversations/pagination" 
			),
		]									
	end

	def show
		@conversation = @app.conversations.find_by(key: params[:id])
		@conversations = search_service.search
		@conversations = @conversations
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

	def update
		@conversation = @app.conversations.find_by(key: params[:id])

		case params[:step]
		when "state"
			menu_items_response("state", 
				->{ @conversation.update(state: params[:state] == 'opened' ? 'closed' : 'opened') }
			)
		when "priorize"
			menu_items_response("priorize", ->{ @conversation.toggle_priority() } )
		when "assignee"
			@agent = @app.agents.find(params[:conversation][:assignee_id])
			menu_items_response("assignee", ->{ @conversation.update(assignee_id: @agent.id ) } )
		when "tags"
			@conversation.tag_list = params[:conversation][:tag_list].reject(&:empty?)
			@conversation.save

			flash.now[:notice] = "Place was updated!"

			render turbo_stream: [
				flash_stream,
				turbo_stream.replace(
					"conversation-item-#{@conversation.key}", 
					partial: "apps/conversations/conversation",
					locals: {
						conversation: @conversation,
						app: @app
					} 
				)
			]
		end
	end

	def edit
		@conversation = @app.conversations.find_by(key: params[:id])

	end

	private def search_service
		@search_service ||= ConversationSearchService.new(
			options: {
				app: @app,
				term: params.dig(:conversation_search_service, :term),
				sort: params.dig(:conversation_search_service, :sort),
				tag: params.dig(:conversation_search_service, :tag),
				agent_id: params.dig(:conversation_search_service, :agent_id)
			}
		)
	end

	private def menu_items_response(item, method)
		if method.call 
			render turbo_stream: [
				turbo_stream.replace(
				"conversation-#{item}-#{@conversation.key}", 
				partial: "apps/conversations/menu_items/#{item}"
				)
			]
		end
	end
end
