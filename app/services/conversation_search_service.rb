# frozen_string_literal: true

class ConversationSearchService
	include ActiveModel::Model

  attr_accessor :app, :sort, :filter, :tag, :term, :agent_id

	def initialize(options: {})
		@app = options[:app]
		@sort = options[:sort]
		@filter = options[:filter]
		@tag = options[:tag]
		@term = options[:term]
		@agent_id = options[:agent_id]
	end


	def search
		conversations = filter_by_agent(@agent_id, @filter)
		# @conversations = @conversations.page(@page).per(@per)
		conversations = sort_conversations(@sort, conversations)
		
		conversations = conversations.tagged_with(@tag) if @tag.present?
		# TODO: add _or_main_participant_name_cont, or do this with Arel
		if @term
			conversations = conversations.ransack(
				messages_messageable_of_ConversationPartContent_type_text_content_cont: @term
			).result
		end

		conversations
	end



	private def filter_by_agent(agent_id, filter)
		collection = @app.conversations
											 .left_joins(:messages)
											 .where.not(conversation_parts: { id: nil })
											 .distinct

		collection = collection.where(state: filter) if filter.present?

		if agent_id.present?
			agent = agent_id.empty? ? nil : agent_id
			collection = collection.where(assignee_id: agent)
		end

		collection
	end

	private def sort_conversations(sort, conversations)
		return conversations unless sort.present?
	
		s = case sort
				when "newest" then "updated_at desc"
				when "oldest" then "updated_at asc"
				when "priority_first" then "priority asc, updated_at desc"
				else
					"id desc"
				end

		if sort != "unfiltered" # && agent_id.blank?
			conversations = conversations.where
																.not(latest_user_visible_comment_at: nil)
		end

		conversations.order(s)

	end
end
