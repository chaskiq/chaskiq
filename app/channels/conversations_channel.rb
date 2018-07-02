class ConversationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"

    @app      = App.find_by(key: params[:app])
    @conversation = @app.conversations.find(params[:id])

    @app_user = @app.app_users
                    .joins(:user)
                    .where("users.email =?", params[:email])
                    .first

    @user     = @app_user.user
    @key      = "conversations:#{@app.key}-#{@conversation.id}"
    stream_from @key
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)
    app_user = @app.app_users
                   .joins(:user)
                   .find_by("users.email": data["email"])

    message = @conversation.messages.find(data["id"])

    if message.app_user_id != app_user.id
      message.read!
    end
  end
end
