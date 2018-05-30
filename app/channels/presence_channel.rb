class PresenceChannel < ApplicationCable::Channel
  def subscribed
    @app      = App.find_by(key: params[:app])
    @app_user = @app.add_user(email: params[:email], properties: params[:properties])
    @user     = @app_user.user
    @key      = "presence:#{@app.key}-#{@user.email}"
    stream_from @key
    pingback
  end

  def pingback
    @app_user.online! if @app_user.offline?
    ActionCable.server.broadcast(@key, @app_user.to_json)
  end

  def unsubscribed
    @app_user.offline! if @app_user.online?
    # Any cleanup needed when channel is unsubscribed
  end

end
