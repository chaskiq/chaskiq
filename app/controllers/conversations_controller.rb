class ConversationsController < ApplicationController

  def index
    @app = App.find_by(key: params[:app_id])
    @conversations = @app.conversations
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "api/v1/conversations/index" }
    end
  end

  def show
    @app = App.find_by(key: params[:app_id])
    @conversation = @app.conversations.find(params[:id])
    @messages = @conversation.messages
    respond_to do |format|
      format.html{ render_empty }
      format.json{ render "api/v1/conversations/show" }
    end
  end

end
