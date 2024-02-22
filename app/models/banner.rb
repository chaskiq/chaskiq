# frozen_string_literal: true

require "link_renamer"

class Banner < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true

  store_accessor :settings, %i[
    hidden_constraints
    mode
    placement
    show_sender
    sender_id
    dismiss_button
    bg_color
    action_text
    url
    font_options
  ]

  def banner_data
    {
      mode: mode,
      placement: placement,
      show_sender: show_sender,
      sender_id: sender_id,
      dismiss_button: dismiss_button,
      bg_color: bg_color,
      action_text: action_text,
      url: url,
      sender_data: sender_data,
      font_options: font_options
    }
  end

  def sender_data
    a = sender_id ? app.agents.find_by(id: sender_id) : nil
    return nil if a.blank?

    {
      id: a.id.to_s,
      displayName: a.display_name,
      avatarUrl: a.avatar_url,
      email: a.email
    }
  end

  def config_fields
    [
      { name: "name", type: "string", grid: { xs: "w-full", sm: "w-3/4" }, col: "sm:col-span-4" },
      # { name: 'subject', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      # { name: 'url', type: 'string', grid: { xs: 'w-full', sm: 'w-1/4' } },
      { name: "description", type: "text", grid: { xs: "w-full", sm: "w-full" }, col: "sm:col-span-6" },
      { name: "scheduled_at", label: "Scheduled at", type: "datetime", col: "sm:col-span-3", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "scheduled_to", label: "Scheduled to", type: "datetime", col: "sm:col-span-3", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "hidden_constraints", label: "Hidden constraints", type: "select",
        options: [
          %w[open open],
          %w[close close],
          %w[click click]
        ],
        multiple: true,
        default: "open",
        grid: { xs: "w-full", sm: "w-full" },
        col: "sm:col-span-6" }

    ]
  end

  def stats_fields
    [
      add_stat_field(
        name: "CloseRateCount", label: "Open/Close rate",
        keys: [{ name: "open", color: "#F4F5F7" },
               { name: "close", color: "#0747A6" }]
      ),
      add_stat_field(
        name: "ClickRateCount", label: "Open/Click rate",
        keys: [{ name: "open", color: "#F4F5F7" },
               { name: "click", color: "#0747A6" }]
      ),
      add_stat_field(
        name: "ClickCloseRateCount", label: "Click/Close rate",
        keys: [{ name: "close", color: "#F4F5F7" },
               { name: "click", color: "#0747A6" }]
      )
    ]
  end

  def self.broadcast_banner_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"

    banners = app.banners.availables_for(user)
    banner = banners.first

    return if banner.blank? || !banner.available_for_user?(user)

    if banners.any?
      data = {
        type: "banners:receive",
        data: banner.as_json(only: [:id], methods: %i[banner_data serialized_content html_content])
      }.as_json

      MessengerEventsChannel.broadcast_to(key, data)

      banner.broadcast_update_to app, user.id,
                                 target: "chaskiq-custom-events",
                                 partial: "messenger/custom_event",
                                 locals: { data: data }

      true
    end
  end
end
