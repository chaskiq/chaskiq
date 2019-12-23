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
end
