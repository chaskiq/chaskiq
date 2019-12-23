# frozen_string_literal: true

class PresenceChannel < ApplicationCable::Channel
  include UserFinder
  after_unsubscribe :offline

  def subscribed
    get_session_data
    # TODO: , change this when leads can have mail
    # if @user_data.blank? or @user_data[:email].blank?
    #  visitor = get_user_by_session
    #  @app_user = visitor
    #  @key = @key + visitor.session_id
    # else
    #  @app_user = @app.app_users
    #              .where("email =?", @user_data[:email])
    #              .first
    #  @key = @key + @app_user.email
    # end

    stream_from @key
    pingback
  end

  def pingback
    get_session_data
    @app_user.online! if @app_user.offline?
  end

  def offline
    get_session_data
    puts "subs #{Redis.new.pubsub('CHANNELS', @key).size}"
    @app_user.offline!
    # if Redis.new.pubsub("CHANNELS", @key).size == 1 && @app_user.online?
  end

  private

  def get_session_data
    @app = App.find_by(key: params[:app])
    get_user_data
    @key = "presence:#{@app.key}-"
    find_user
    @key += @app_user.session_id
    @key += @app_user.email if @app_user.type == 'AppUser'
  end
end
