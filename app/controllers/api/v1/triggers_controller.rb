
class Api::V1::TriggersController < ApiController
  before_action :find_app
  before_action :get_user_data
  before_action :authorize!

  def index

    @trigger = @app.triggers.first
=begin
    message = @trigger[:actions].find{|o| o.keys.include? :message }

    options = { from: @app.agents.first,
                message: message[:message],
                #message_source: "app",
                participant: get_app_user
              }

    @app.start_conversation(options)

    MessengerEventsChannel.broadcast_to("#{@app.key}", {
      type: "triggers:receive", 
      data: @app.triggers.first
    }.as_json)
=end
  end


private

  def find_app
    @app = App.find_by(key: params[:app_id])
  end

end
