# frozen_string_literal: true

class EventsChannel < ApplicationCable::Channel
  def subscribed
    @app = App.find_by(key: params[:app])
    stream_from "events:#{@app.key}"
    # @app_user = @app.agents.find_by(email: @user_data[:email])
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def receive_conversation_part(data)
    @app = App.find_by(key: params[:app])
    @conversation = @app.conversations.find(data['conversation_id'])
    message = @conversation.messages.find(data['message_id'])
    message.read! if message.authorable_type == 'AppUser' # read anyway #!= @app_user
  end
end
