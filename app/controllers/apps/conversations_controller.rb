class Apps::ConversationsController < ApplicationController
	before_action :find_app

	def index
		@conversations = filter_by_agent(params[:agent_id], params[:filter])
		@conversations = @conversations.page(params[:page]).per(params[:per])
		sort_conversations(params[:sort])
		@conversations = @conversations.tagged_with(params[:tag]) if params[:tag].present?
		# TODO: add _or_main_participant_name_cont, or do this with Arel
		if params[:term]
			@conversations = @conversations.ransack(
				messages_messageable_of_ConversationPartContent_type_text_content_cont: params[:term]
			).result
		end

		@conversations = @app.conversations
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

	private def filter_by_agent(agent_id, filter)
		collection = @app.conversations
											 .left_joins(:messages)
											 .where.not(conversation_parts: { id: nil })
											 .distinct

		collection = collection.where(state: filter) if filter.present?

		if agent_id.present?
			agent = agent_id.zero? ? nil : agent_id
			collection = collection.where(assignee_id: agent)
		end

		collection
	end

	private def sort_conversations(sort)
		if sort.present?
			s = case sort
					when "newest" then "updated_at desc"
					when "oldest" then "updated_at asc"
					when "priority_first" then "priority asc, updated_at desc"
					else
						"id desc"
					end

			if sort != "unfiltered" # && agent_id.blank?
				@conversations = @conversations.where
																 .not(latest_user_visible_comment_at: nil)
			end

			@conversations = @conversations.order(s)
		end
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
