# frozen_string_literal: true

module ApplicationHelper
  def flash_messages(_opts = {})
    flash.each do |msg_type, message|
      flash.delete(msg_type)
      concat(content_tag(:div, message, class: "alert #{bootstrap_class_for(msg_type)}") do
        concat content_tag(:button, "<i class='fa fa-times-circle'></i>".html_safe, class: 'close', data: { dismiss: 'alert' })
        concat message
      end)
    end

    session.delete(:flash)
    nil
  end

  def support_app_data
    app_key = ENV['SUPPORT_APP_KEY']
    return if app_key.blank?

    support_app = App.find_by(key: app_key)
    return if support_app.blank?

    key = support_app.encryption_key
    json_payload = {}

    if current_agent.present?
      user_options = {
        email: current_agent.email,
        identifier_key: OpenSSL::HMAC.hexdigest('sha256', key, current_agent.email),
        properties: {
          name: current_agent.display_name
        }
      }
      json_payload.merge!(user_options)
    end

    # encrypted_data = JWE.encrypt(json_payload.to_json, key, alg: 'dir')
    # { enc: encrypted_data, app: support_app }
    { enc: json_payload.to_json, app: support_app }
  end
end
