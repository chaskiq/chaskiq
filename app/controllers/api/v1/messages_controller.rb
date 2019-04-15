class Api::V1::MessagesController < ApiController

  before_action :get_app
  before_action :get_user_data
  before_action :authorize!

  def show
    @user = get_app_user
    @message = @app.messages.find(params[:id]).show_notification_for(@user)

    if(@message.blank?)
      render json: {}, status: 406 and return
    end
    render :show
  end

  def index
    @messages = @app.user_auto_messages.availables_for(get_app_user)
    render :index
  end

private

  def get_app
    @app = App.find_by(key: params[:app_id])
  end

  def find_user(email)
    @app.app_users.joins(:user).where(["users.email =?", email ]).first  
  end
end

