=begin
class ConversationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel" # agents only
    @app      = App.find_by(key: params[:app])

    get_user_data

    if @user_data[:agent]
      @app_user = @app.agents.find_by(email: @user_data[:email])
    end

    @key = "conversations:#{@app.key}"
    stream_from @key
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive(data)   
    binding.pry
  end
end
=end
