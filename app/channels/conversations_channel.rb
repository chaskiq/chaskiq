class ConversationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    @app      = App.find_by(key: params[:app])
    @conversation = @app.conversations.find(params[:id])

    get_user_data

    if @user_data[:agent]
      @app_user = @app.agents.find_by(email: @user_data[:email])
    else
      @app_user = @app.app_users
                    .joins(:user)
                    .where("users.email =?", @user_data[:email])
                    .first
      #@user     = @app_user.user
    end

    @key      = "conversations:#{@app.key}-#{@conversation.id}"
    stream_from @key
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)   
    message = @conversation.messages.find(data["id"])

    if message.authorable != @app_user
      message.read!
    end

  end
end
