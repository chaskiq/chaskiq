# frozen_string_literal: true

class PresenceChannel < ApplicationCable::Channel
  include UserFinder
  after_unsubscribe :offline

  def subscribed
    if current_user.blank? || self.app.blank?   
      reject 
      return
    end 
    @key = "presence:#{app.key}-#{current_user.session_id}"
    stream_from @key
    pingback
  end

  def pingback
    # notify_error("pingback error") if current_user.blank?
    current_user&.online!
  end

  def offline
    # notify_error("offlinize error") if current_user.blank?
    # puts "subs #{Redis.new.pubsub('CHANNELS', @key).size}"
    current_user&.offline!
    ### if Redis.new.pubsub("CHANNELS", @key).size == 1 && current_user.online?
  end

  def notify_error(err)
    Bugsnag.notify(err) do |report|
      report.add_tab(
        :context,
        {
          key: @key,
          app: app&.key
        }
      )
    end
  end
end
