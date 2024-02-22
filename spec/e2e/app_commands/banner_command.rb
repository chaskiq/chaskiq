# frozen_string_literal: true

app_key = command_options.delete("app_key")
message = command_options.delete("serialized_content")

serialized_content = MessageApis::BlockManager.serialized_text(message)

app = App.find_by(key: app_key)

message = FactoryBot.create(:banner,
                            serialized_content: serialized_content,
                            app: app,
                            segments: nil, # app.segments.first.predicates,
                            scheduled_at: 2.days.ago,
                            scheduled_to: 30.days.from_now,
                            settings: command_options)

message.enable!
