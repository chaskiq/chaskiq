# frozen_string_literal: true

module Events
  class LeadsConvert
    def self.perform(event)
      conversation = event.eventable
      app = conversation.app
      
      # TODO query specific packages     
      app.app_package_integrations.each do |package|
        package.trigger(event)
      end
      
    end
  end
end
