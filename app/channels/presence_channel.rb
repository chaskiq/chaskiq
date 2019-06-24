class PresenceChannel < ApplicationCable::Channel
  def subscribed
    @app      = App.find_by(key: params[:app])

    get_user_data

    visitor = nil
    # TODO , change this when leads can have mail
    if @user_data[:email].blank?
      visitor = get_user_by_session
      @app_user = visitor 
    else
      @app_user = @app.app_users
                  .where("email =?", @user_data[:email])
                  .first
    end

    @key      = "presence:#{@app.key}-#{visitor.present? ? visitor.session_id : @app_user.email}"
    stream_from @key
    pingback
  end

  def pingback
    @app_user.online! if @app_user.offline?
  end

  def unsubscribed
    @app_user.offline! if @app_user.online?
    # Any cleanup needed when channel is unsubscribed
  end

end
