class PresenceChannel < ApplicationCable::Channel
  def subscribed
    @app      = App.find_by(key: params[:app])

    @app_user = @app.app_users
                    .joins(:user)
                    .where("users.email =?", params[:email])
                    .first
    #@app.users.find_by(email: params[:email]).try(:app_user) 
    #add_user(email: params[:email], properties: params[:properties])
    @user     = @app_user.user
    @key      = "presence:#{@app.key}-#{@user.email}"
    stream_from @key
    pingback
  end

  def pingback
    @app_user.online! if @app_user.offline?
    ActionCable.server.broadcast(@key, @app_user.to_json)
    ActionCable.server.broadcast("events:#{@app.key}", formatted_user)
  end

  def unsubscribed
    @app_user.offline! if @app_user.online?
    # Any cleanup needed when channel is unsubscribed
    ActionCable.server.broadcast("events:#{@app.key}", formatted_user)
  end

  def formatted_user

    { email: @app_user.user.email,
      properties: @app_user.properties,
      state: @app_user.state
    }.to_json

  end

end
