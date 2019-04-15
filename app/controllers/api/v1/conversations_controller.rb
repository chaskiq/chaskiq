class Api::V1::ConversationsController < ApiController

  def show
    @app = App.find_by(key: params[:app_id])
    @user = find_user(get_user_data["email"])
    @conversation = user_conversations.find(params[:id])
    # TODO paginate here
    @messages = @conversation.messages
    render :show
  end

  def index
    # TODO: paginate here
    @app = App.find_by(key: params[:app_id])
    @user = find_user(get_user_data["email"])
    @conversations = @app.conversations.where(main_participant: @user.id)
    render :index
  end

  def create
    @app = App.find_by(key: params[:app_id])
    #@user = find_user(get_user_data["email"])    
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
    @user = find_user(get_user_data["email"])
    @conversation = user_conversations.find(params[:id])

    @message = @conversation.add_message({
      from: @user.email,
      message: params[:message]
    })
    render :show
  end

private

  def user_conversations
    @app.conversations.where(main_participant: @user.id)
  end

  def get_user_data
    @user_data = JSON.parse(request.headers["http_user_data".upcase]) rescue nil
  end

  def find_user(email)
    @app.app_users.joins(:user).where(["users.email =?", email ]).first  
  end
end
