class PresenceChannel < ApplicationCable::Channel
  def subscribed
    @app      = App.find_by(key: params[:app])
    @app_user = @app.add_user(email: params[:email])
    @user     = @app_user.user
    @key      = "presence:#{@app.key}-#{@user.email}"
    stream_from @key
    pingback
  end

  def pingback
    @app_user.online! if @app_user.offline?
    ActionCable.server.broadcast(@key, "pingback")
    #self.class.broadcast_to(@key, "pingback")
  end

  def unsubscribed
    @app_user.offline! if @app_user.online?
    # Any cleanup needed when channel is unsubscribed
  end

end
