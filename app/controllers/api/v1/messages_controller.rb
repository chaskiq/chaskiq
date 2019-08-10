class Api::V1::MessagesController < ApiController

  before_action :get_app
  before_action :get_user_data
  before_action :authorize!

  def show
    @user = get_app_user
    @message = @app.messages.find(params[:id]).show_notification_for(@user)

    # TODO: select admin users from some config (implement that config!)
    # TODO: this must not init conversation utomatically, instead we must 
    # let the user reply a message and then only we start the conversation
    admin = @app.agents.first

    @conversation = @app.start_conversation({
        #message: @message.mustache_template_for(@user), 
        from: admin,
        messageable: @message,
        participant: @user
      }) if @message.present? && !added_message?

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

  def added_message?

    @user.conversations
      .joins(:messages)
      .where("conversation_parts.messageable_type = ?", "Message")
      .where("conversation_parts.messageable_id = ?", @message.id)
      .any?
      #.where("conversation_parts.message_id =?", @message.id) 
  end

  def get_app
    @app = App.find_by(key: params[:app_id])
  end

  def find_user(email)
    @app.app_users.where(["email =?", email ]).first  
  end
end

