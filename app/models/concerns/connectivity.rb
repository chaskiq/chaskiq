# frozen_string_literal: true

module Connectivity
  extend ActiveSupport::Concern

  def offline?
    !state || state == 'offline'
  end

  def online?
    state == 'online'
  end

  def channel_key
    "presence:#{app.key}-#{email}"
  end

  def online!
    self.state = 'online'
    self.last_visited_at = Time.now

    if save
      ActionCable.server.broadcast(channel_key, to_json) # not necessary
      ActionCable.server.broadcast("events:#{app.key}",
                                   type: 'presence',
                                   data: formatted_user)
    end
  end

  def offline!
    self.state = 'offline'
    self.last_visited_at = Time.now
    if save
      ActionCable.server.broadcast("events:#{app.key}",
                                   type: 'presence',
                                   data: formatted_user)
    end
  end
end