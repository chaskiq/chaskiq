class EventsChannel < ApplicationCable::Channel
  def subscribed
    @app  = App.find_by(key: params[:app])
    stream_from "events:#{@app.key}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
