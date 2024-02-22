# frozen_string_literal: true

app = App.find_by(key: command_options.fetch("app_key"))
text = command_options.fetch("text")
message = FactoryBot.create(:user_auto_message,
                            app: app,
                            serialized_content: MessageApis::BlockManager.serialized_text(text),
                            segments: nil, # app.segments.first.predicates,
                            scheduled_at: 2.days.ago,
                            scheduled_to: 30.days.from_now,
                            settings: command_options.fetch("hidden_constraints"))

message.enable!
