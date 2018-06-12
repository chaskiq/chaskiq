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
    @conversation = @app.start_conversation({
      message: params[:message], 
      from: @app.users.find_by(email: params[:email])
    })
    render :show
  end

  def update
    @app = App.find_by(key: params[:app_id])
    @conversation = @app.conversations.find(params[:id])
    @message = @conversation.add_message({
      from: @app.users.find_by(email: params[:email]),
      message: params[:message]
    })
    render :show
  end

end
