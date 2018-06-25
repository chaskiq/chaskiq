class Api::V1::ConversationsController < ApplicationController

  def show
    @app = App.find_by(key: params[:app_id])
    @conversation = @app.conversations.find(params[:id])
    @messages = @conversation.messages
    render :show
  end

  def index
    @app = App.find_by(key: params[:app_id])
    @conversations = @app.conversations
    render :index
  end

  def create
    @app = App.find_by(key: params[:app_id])
    user = find_user(params[:email])
    if params[:message].present?
      @conversation = @app.start_conversation({
        message: params[:message], 
        from: user
      })
    else
      # return a conversation with empty messages , if any or create new one
      # this is to avoid multiple empty convos
      @conversation = user.conversations
                          .left_joins(:messages)
                          .where(conversation_parts: {id: nil})
                          .uniq
                          .first || @app.conversations.create(main_participant: user)
    end
    render :show
  end

  def update
    @app = App.find_by(key: params[:app_id])
    @conversation = @app.conversations.find(params[:id])
    @message = @conversation.add_message({
      from: find_user(params[:email]),
      message: params[:message]
    })
    render :show
  end

private
  def find_user(email)
    @app.app_users.joins(:user).where(["users.email =?", email ]).first  
  end
end
