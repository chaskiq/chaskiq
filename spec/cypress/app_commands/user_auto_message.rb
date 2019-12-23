# frozen_string_literal: true

app = App.find_by(key: command_options.fetch('app_key'))

message = FactoryBot.create(:user_auto_message,
                            app: app,
                            segments: nil, # app.segments.first.predicates,
                            scheduled_at: 2.day.ago,
                            scheduled_to: 30.days.from_now,
                            settings: command_options.fetch('hidden_constraints'))

message.enable!
