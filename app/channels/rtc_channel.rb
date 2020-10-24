class RtcChannel < ApplicationCable::Channel
  def subscribed
    stream_from "rtc_channel_#{params[:room]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
