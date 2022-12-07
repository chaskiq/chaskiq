# frozen_string_literal: true

module Notificable
  extend ActiveSupport::Concern

  # included do
  # end

  # notifies an event to app
  # def notify_event
  #   notify_notification({
  #                         subject: "hello",
  #                         message: "oliloii",
  #                         timeout: 50_500,
  #                         actions: [
  #                           { type: "navigate", path: "/", label: "Go", tone: "indigo" },
  #                           { type: "close", label: "Dismiss" }
  #                         ]
  #                       })
  # end

  # notifies event to specific agent
  # def notify_agent(agent)
  #   notify_agent_notification(agent, {
  #                               subject: "hello",
  #                               message: "oliloii",
  #                               timeout: 50_500,
  #                               actions: [
  #                                 { type: "navigate", path: "/", label: "Go to conversation", tone: "indigo" },
  #                                 { type: "close", label: "Dismiss" }
  #                               ]
  #                             })
  # end

  def notify_notification(params)
    EventsChannel.broadcast_to(key,
                               {
                                 type: "notification",
                                 data: params
                               }.as_json)
  end

  def notify_agent_notification(agent, params)
    EventsChannel.broadcast_to("#{key}-#{agent.id}",
                               {
                                 type: "notification",
                                 data: params
                               }.as_json)
  end
end
