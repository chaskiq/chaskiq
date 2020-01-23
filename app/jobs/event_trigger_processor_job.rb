class EventTriggerProcessorJob < ApplicationJob
  queue_as :default
  def perform(id:, event_id:)

    app = App.find(id)
    event = Event.find(event_id)

    compatible_packages = AppPackage.tagged_with(event.action)
                                    .pluck(:id)

    return if compatible_packages.blank?                             

    app.app_package_integrations
    .where(app_package: compatible_packages).each do |package|
      package.trigger(event)
    end

  end
end