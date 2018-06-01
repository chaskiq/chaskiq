class Api::V1::AppsController < ActionController::API

  def ping
    @app = App.find_by(key: params[:id])
    data = resource_params.to_h
    ap = @app.add_visit(data)
    render json: ap
  end

  def resource_params
    params.require(:user_data).permit! #(:name, :age)
  end
end
