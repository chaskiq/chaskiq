# frozen_string_literal: true

class PresenceChannel < ApplicationCable::Channel
  include UserFinder
  after_unsubscribe :offline

  def subscribed
    if current_user.blank? || self.app.blank?   
      reject 
      return
    end 
    stream_from key
    pingback
  end

  def key
    "presence:#{app.key}-#{current_user.session_id}"
  end

  def pingback
    # notify_error("pingback error") if current_user.blank?
    current_user&.online!
  end

  def offline
    OfflineCheckerJob.set(wait: 5.seconds).perform_later(current_user, key)
  end

  def notify_error(err)
    Bugsnag.notify(err) do |report|
      report.add_tab(
        :context,
        {
          key: key,
          app: app&.key
        }
      )
    end
  end
end
