class Api::V1::MessagesController < ApplicationController

  def show
    @app = App.find_by(key: params[:app_id])
    
    begin
      data = JSON.parse(request.headers["HTTP_USER_DATA"])
      @user = find_user(data["email"]) 
    rescue 
       render json: {}, status: 406 and return
    end

    @message = @app.messages.find(params[:id]).show_notification_for(@user)

    if(@message.blank?)
      render json: {}, status: 406 and return
    end

    render :show
  end

  def index
    @app = App.find_by(key: params[:app_id])
    #@conversations = @app.conversations

    begin
      data = JSON.parse(request.headers["HTTP_USER_DATA"])
      user = find_user(data["email"]) 
    rescue 
       render json: {}, status: 406 and return
    end

    @messages = @app.user_auto_messages.availables_for(user)
    
    render :index
  end


private
  def find_user(email)
    @app.app_users.joins(:user).where(["users.email =?", email ]).first  
  end

=begin
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
=end

private
  def find_user(email)
    @app.app_users.joins(:user).where(["users.email =?", email ]).first  
  end
end

