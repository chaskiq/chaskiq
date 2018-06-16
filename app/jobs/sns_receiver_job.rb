class SnsReceiverJob < ApplicationJob
  queue_as :default

  #Receive hook
  def perform(track_type, m, referrer)
    data = m["mail"]["messageId"]

    metric = Chaskiq::Metric.find_by(data:parsed_message_id(m))

    return if metric.blank?

    campaign = metric.campaign
    #subscriber = metric.trackable
    #subscription = campaign.subscriptions.find_by(subscriber: subscriber)
    subscription = metric.trackable

    subscription.unsubscribe! if track_type == "spam"
    subscription.subscriber.send("track_#{track_type}".to_sym, {
      host: referrer,
      campaign_id: campaign.id,
      data: data
    })
  end

  def parsed_message_id(m)
    m["mail"]["messageId"]
  end
end
