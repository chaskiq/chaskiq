class SnsReceiverJob < ApplicationJob
  queue_as :default

  #Receive hook
  def perform(track_type, m, referrer)
    data = m["mail"]["messageId"]

    metric = Metric.find_by(data: parsed_message_id(m))

    return if metric.blank?

    campaign = metric.campaign
    app_user = metric.trackable
    
    app_user.unsubscribe! if track_type == "spam"
    app_user.send("track_#{track_type}".to_sym, {
      host: referrer,
      campaign_id: campaign.id,
      data: data
    })
  end

  def parsed_message_id(m)
    m["mail"]["messageId"]
  end
end
