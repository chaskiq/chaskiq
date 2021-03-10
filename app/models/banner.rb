# frozen_string_literal: true

require 'link_renamer'

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
    show_sender
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
      show_sender: show_sender,
      sender_data: sender_data
    }
  end

  def sender_data
    a = sender_id ? app.agents.find(sender_id) : nil
    return nil unless a.present?

    {
      id: a.id,
      displayName: a.display_name,
      avatarUrl: a.avatar_url,
      email: a.email
    }
  end

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      # { name: 'subject', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      # { name: 'url', type: 'string', grid: { xs: 'w-full', sm: 'w-1/4' } },
      { name: 'description', type: 'text', grid: { xs: 'w-full', sm: 'w-full' } },
      { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'scheduledTo', label: 'Scheduled to', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'hiddenConstraints', label: 'Hidden constraints', type: 'select',
        options: [
          { label: 'open', value: 'open' },
          { label: 'close', value: 'close' },
          { label: 'click', value: 'click' }
        ],
        multiple: true,
        default: 'open',
        grid: { xs: 'w-full', sm: 'w-full' } }

    ]
  end

  def stats_fields
    [
      {
        name: 'CloseRateCount', label: 'Open/Close rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'close', color: '#0747A6' }]
      },
      {
        name: 'ClickRateCount', label: 'Open/Click rate',
        keys: [{ name: 'open', color: '#F4F5F7' },
               { name: 'click', color: '#0747A6' }]
      },
      {
        name: 'ClickCloseRateCount', label: 'Click/Close rate',
        keys: [{ name: 'close', color: '#F4F5F7' },
               { name: 'click', color: '#0747A6' }]
      }
    ]
  end

  def self.broadcast_banner_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"

    banners = app.banners.availables_for(user)
    banner = banners.first

    return if banner.blank? || !banner.available_for_user?(user)

    if banners.any?
      MessengerEventsChannel.broadcast_to(key, {
        type: 'banners:receive',
        data: banner.as_json(only: [:id], methods: %i[banner_data serialized_content html_content])
      }.as_json)

      true
    end
  end
end
