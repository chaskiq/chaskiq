class OfflineCheckerJob < ApplicationJob
  queue_as :default

  def perform(current_user, key)
    return if Redis.new.pubsub("CHANNELS", key).any?
    return if current_user.offline?
    current_user&.offline!
  end
end
