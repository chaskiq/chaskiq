# frozen_string_literal: true

class AgentChannel < ApplicationCable::Channel
  def subscribed
    stream_from "events:#{app.key}-#{current_user.id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
