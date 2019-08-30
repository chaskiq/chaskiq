class AppUserEventJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id: )
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    @tours = @app.tours.enabled

    key = "#{@app.key}-#{app_user.session_id}"

    #render json: @tours.as_json(only: [:id], methods: [:steps])
    MessengerEventsChannel.broadcast_to(key, {
      type: "tours:receive", 
      data: @tours.as_json(only: [:id], methods: [:steps])
    }.as_json) if @tours.any?

    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: @app.bot_tasks.first
    }.as_json) if @app.bot_tasks.any?

    @messages = @app.user_auto_messages.availables_for(app_user)


    MessengerEventsChannel.broadcast_to(key, {
      type: "messages:receive", 
      data: @messages.as_json(only: [ :id,
                                      :created_at, 
                                      :updated_at, 
                                      :serialized_content,
                                      :theme
                                    ])
      }
    ) if @messages.any?
    
  end
end
