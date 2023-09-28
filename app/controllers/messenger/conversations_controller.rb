class Messenger::ConversationsController < ApplicationController

  def index
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversations = @current_user.conversations

    render turbo_stream: [
      turbo_stream.replace("header-content",
       partial: "messenger/conversations/conversations_header", 
       locals: { app: @app, user: @current_user }
      ),
      turbo_stream.update("bbbb",
        partial: "messenger/conversations/conversations",
        locals: {
          app: @app, 
          conversations: @conversations,
          user: @current_user
        }
       )
    ]
  end

  def show
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversation = @current_user.conversations.find_by(key: params[:id])

    collection = @conversation.messages
                                .visibles
                                .order("id desc")
                                .page(params[:page])
                                .per(10)

    render turbo_stream: [
      turbo_stream.replace("header-content",
       partial: "messenger/conversations/conversation_header", 
       locals: { 
          app: @app, 
          user: @current_user, 
          conversation: @conversation 
        }
      ),
      turbo_stream.update("bbbb",
        partial: "messenger/conversations/conversation",
        locals: {
          app: @app, 
          conversation: @conversation, 
          messages: collection,
          user: @current_user
        }
      )
    ]
  end

  def new
    @app = App.find_by(key: params[:messenger_id])
    @current_user = @app.app_users.first
    @conversation = @app.conversations.new

    render turbo_stream: [
      turbo_stream.replace("header-content",
       partial: "messenger/conversations/conversation_header", 
       locals: { 
        app: @app, 
        user: @current_user, 
        conversation: @conversation 
      }
      ),
      turbo_stream.update("bbbb",
        partial: "messenger/conversations/conversation",
        locals: {
          app: @app, 
          conversation: @conversation, 
          messages: []
        }
      )
    ]
  end

  def create
    render text: "ssss"
  end
end
