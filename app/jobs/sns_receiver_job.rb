# frozen_string_literal: true

class SnsReceiverJob < ApplicationJob
  queue_as :default

  # Receive hook
  def perform(track_type, m, _referrer)
    part = m['mail']['headers'].find do |o|
      o['name'] == 'X-CHASKIQ-PART-ID'
    end

    campaign = m['mail']['headers'].find do |o|
      o['name'] === 'X-CHASKIQ-CAMPAIGN-ID'
    end

    # handle conversation and exit
    handle_chat_message(track_type, m, part['value']) if part.present?

    # handle campaign
    handle_campaign_message(track_type, m, _referrer) if campaign.present?


    unsubscribe_user(track_type, m)
  end

  def handle_campaign_message(track_type, m, _referrer)
    data = m[track_type]
    # message_id = parsed_message_id(m)

    campaign_id = m['mail']['headers'].find do |o|
      o['name'] === 'X-CHASKIQ-CAMPAIGN-ID'
    end.dig('value')

    user_id = m['mail']['headers'].find do |o|
      o['name'] === 'X-CHASKIQ-CAMPAIGN-TO'
    end.dig('value')

    campaign = Campaign.find_by(id: campaign_id)
    app_user = AppUser.find_by(id: user_id)

    return if campaign.blank? || app_user.blank?

    app_user.send("track_#{track_type}".to_sym,
                  host: data['ipAddress'],
                  trackable: campaign,
                  # message_id: message_id,
                  data: data)
  end

  def handle_chat_message(track_type, m, part_id)
    return unless track_type == 'open'

    recipient = m['mail']['headers'].find { |o| o['name'] == 'Return-Path' }['value']
    recipient_parts = URLcrypt.decode(recipient.split('@').first.split('+').last)
    app_id, conversation_id = recipient_parts.split('+')

    conversation = Conversation.find_by(id: conversation_id)
    return if conversation.blank?
    message = conversation.messages.find(part_id)
    return if message.blank?
    message.read!
  end

private

  def unsubscribe_user(track_type, m)
    case track_type 
    when "complaint"
      email = m.dig("complaint", "complainedRecipients").map{|o| o["emailAddress"]}
      users = AppUser.where(email: email ) 
      users.map(&:unsubscribe!)
      return true
    when "bounce"
      return unless m["bounce"]["bounceType"] == "Permanent"
      email = m.dig("bounce", "bouncedRecipients").map{|o| o["emailAddress"]}
      users = AppUser.where(email: email ) if email.present?    
      users.map(&:unsubscribe!)
      return true
    end
  end

  def parsed_message_id(m)
    m['mail']['headers'].find do |o|
      o['name'] == 'Message-ID'
    end['value'].split('@').first.gsub('<', '')
  end

  def get_email_from_notification(m)
    m.dig("mail", "commonHeaders", "to")
  end
end
