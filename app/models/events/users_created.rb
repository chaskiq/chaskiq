# frozen_string_literal: true

module Events
  class UsersCreated
    def self.perform(event)
      app_user = event.eventable
      app = app_user.app
      app.app_metrics.create(kind: "new_users", value: diff)

      # AppIdentity.new(app.key).new_users.incr(1, Time.zone.now)

      EventTriggerProcessorJob.perform_later(id: app.id, event_id: event.id)
    end
  end
end
