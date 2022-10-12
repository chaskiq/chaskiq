module Trackeable
  extend ActiveSupport::Concern

  private

  def track_event(resource, action)
    resource.log_async(action: action, user: resource, ip: request.remote_ip)
  end
end
