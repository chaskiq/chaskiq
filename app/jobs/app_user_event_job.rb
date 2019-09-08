class AppUserEventJob < ApplicationJob
  queue_as :default

  # send notification unless it's read
  def perform(app_key:, user_id: )
    @app = App.find_by(key: app_key)
    app_user = @app.app_users.find(user_id)

    key = "#{@app.key}-#{app_user.session_id}"

    @tours = @app.tours.availables_for(app_user).enabled
    MessengerEventsChannel.broadcast_to(key, {
      type: "tours:receive", 
      data: @tours.as_json(only: [:id], methods: [:steps, :url])
    }.as_json) if @tours.any?

    bot_task = @app.bot_tasks.first

    MessengerEventsChannel.broadcast_to(key, {
      type: "triggers:receive", 
      data: {trigger: bot_task, step: bot_task.paths.first["steps"].first }
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
