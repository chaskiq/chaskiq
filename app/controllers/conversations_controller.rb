class ConversationsController < ApplicationController

  def index
    @app = App.find_by(key: params[:app_id])
    @conversations = @app.conversations
                          .left_joins(:messages)
                          .where.not(conversation_parts: {id: nil})
                          .uniq
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "api/v1/conversations/index" }
    end
  end

  def show
    @app = App.find_by(key: params[:app_id])
    @conversation = @app.conversations.find(params[:id])
    @messages = @conversation.messages.order("id asc")
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "api/v1/conversations/show" }
    end
  end

  def update
    @app = App.find_by(key: params[:app_id])

    @conversation = @app.conversations.find(params[:id])
    @app_user = @app.app_users.joins(:user).where(["users.email =?", current_user.email ]).first 

    @message = @conversation.add_message({
      from: @app_user,
      message: params[:message]
    })
    render "api/v1/conversations/show"
  end

end
