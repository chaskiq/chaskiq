class OfflineCheckerJob < ApplicationJob
  queue_as :default

  def perform(user_id, key)
    return if Redis.current.pubsub("CHANNELS", key).any?
    u = AppUser.find(user_id)
    return unless u.present?
    return if u.offline?
    u&.offline!
  end
end
