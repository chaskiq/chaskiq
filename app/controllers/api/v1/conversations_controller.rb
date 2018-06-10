class Api::V1::ConversationsController < ApplicationController

  def show
    binding.pry
  end

  def index
    @app = App.find_by(key: params[:app_id])
    @conversations = @app.conversations
    render :index
  end

end
