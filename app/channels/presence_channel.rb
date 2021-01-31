# frozen_string_literal: true

class PresenceChannel < ApplicationCable::Channel
  include UserFinder
  after_unsubscribe :offline

  def subscribed
    reject unless current_user

    stream_from @key
    pingback
  end

  def pingback
    current_user.online! if current_user.offline?
  end

  def offline
    puts "subs #{Redis.new.pubsub('CHANNELS', @key).size}"
    current_user.offline!
    # if Redis.new.pubsub("CHANNELS", @key).size == 1 && current_user.online?
  end

  private

  def get_session_data
    get_user_data
    @key = "presence:#{app.key}-"
    find_user
    @key += current_user.session_id
    @key += current_user.email if current_user.type == 'AppUser'
  end
end
