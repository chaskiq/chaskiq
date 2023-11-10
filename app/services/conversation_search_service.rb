# frozen_string_literal: true

class ConversationSearchService
  include ActiveModel::Model

  attr_accessor :app, :sort, :filter, :tag, :term, :agent_id, :channel_id, :page, :per

  def initialize(options: {})
    @app = options[:app]
    @sort = options[:sort] || "newest"
    @filter = options[:filter] || "opened"
    @tag = options[:tag]
    @term = options[:term]
    @agent_id = options[:agent_id]
    @channel_id = options[:channel_id]
    @page = options[:page]
    @per = options[:per]
  end

  def search
    @app.blocked?
    @app.plan.allow_feature!("Conversations")
    # authorize! object, to: :can_read_conversations?, with: AppPolicy

    @collection = @app.conversations
                      .left_joins(:messages)
                      .where.not(conversation_parts: { id: nil })
                      .distinct

    @collection = @collection.where(state: @filter) if @filter.present?

    if @channel_id.present?
      @collection = @collection
                    .joins(:conversation_channels)
                    .where("conversation_channels.provider =?", @channel_id)
    end

    @collection = filter_by_agent(@agent_id) if @agent_id.present?
    @collection = @collection.page(@page).per(@per).fast_page
    @collection = sort_conversations(@sort)
    @collection = @collection.tagged_with(@tag) if @tag.present?
    if @term
      query_term = :main_participant_full_name_or_main_participant_name_or_main_participant_email_or_main_participant_postal_or_main_participant_phone_or_messages_messageable_of_ConversationPartContent_type_text_content_i_cont_any
      @collection = @collection.ransack(
        query_term => @term
      ).result
    end

    @collection.includes(
      :main_participant,
      :conversation_channels,
      :tags,
      :latest_message,
      assignee: { avatar_attachment: :blob }
      # latest_message: {
      #  authorable: { avatar_attachment: :blob },
      # },
    )
  end

  private

  def sort_conversations(sort)
    return @collection if sort.blank?

    s = case sort
        when "updated" then "updated_at desc"
        when "newest" then "latest_user_visible_comment_at desc"
        when "oldest" then "updated_at asc"
        when "priority_first" then "priority asc, updated_at desc"
        else
          "id desc"
        end

    if sort != "unfiltered" # && agent_id.blank?
      @collection = @collection.where
                               .not(latest_user_visible_comment_at: nil)
    end

    @collection.order(s)
  end

  def filter_by_agent(agent_id)
    return @collection.where(assignee_id: nil) if agent_id == "0"

    @collection.where(assignee_id: agent_id)
  end
end
