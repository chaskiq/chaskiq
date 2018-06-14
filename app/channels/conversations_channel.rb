class ConversationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"

    @app      = App.find_by(key: params[:app])
    @converstion = @app.conversations.find(params[:id])

    @app_user = @app.app_users
                    .joins(:user)
                    .where("users.email =?", params[:email])
                    .first

    @user     = @app_user.user
    @key      = "conversations:#{@app.key}-#{@converstion.id}"
    stream_from @key
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
