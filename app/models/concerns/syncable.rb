# frozen_string_literal: true

module Syncable
  extend ActiveSupport::Concern

  def notify_events_subscribers(app_key, event_name, params)
    EventsChannel.broadcast_to(app_key,
                               {
                                 type: event_name,
                                 data: params
                               }.as_json)
  end
end
