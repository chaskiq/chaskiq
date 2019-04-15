class ConversationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"

    @app      = App.find_by(key: params[:app])
    @conversation = @app.conversations.find(params[:id])

    user_data = get_user_data

    @app_user = @app.app_users
                    .joins(:user)
                    .where("users.email =?", user_data[:email])
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
    # right now is the only way to know if the read is from the reader and not the messages's author
    if message.app_user_id != app_user.id
      message.read!
    end
  end
end
