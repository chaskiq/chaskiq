
class Api::V1::ToursController < ApiController
  before_action :find_app
  before_action :get_user_data
  before_action :authorize!

  def index
    @tours = @app.tours.enabled
    render json: @tours.as_json(only: [:id], methods: [:steps])
    #MessengerEventsChannel.broadcast_to("#{@app.key}", {
    #  type: "triggers:receive", 
    #  data: @app.triggers.first
    #}.as_json)
  end

private

  def find_app
    @app = App.find_by(key: params[:app_id])
  end

end
