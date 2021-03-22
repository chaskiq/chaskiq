# frozen_string_literal: true

require 'link_renamer'

class Tour < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true
  store_accessor :settings, %i[hidden_constraints url steps]
  before_save :fill_steps

  def config_fields
    [
      { name: 'name', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      { name: 'subject', type: 'string', grid: { xs: 'w-full', sm: 'w-3/4' } },
      { name: 'url', type: 'string', grid: { xs: 'w-full', sm: 'w-1/4' } },

      { name: 'description', type: 'text', grid: { xs: 'w-full', sm: 'w-full' } },

      { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },
      { name: 'scheduledTo', label: 'Scheduled to', type: 'datetime', grid: { xs: 'w-full', sm: 'w-1/2' } },

      { name: 'hiddenConstraints', label: 'Hidden constraints', type: 'select',
        options: [
          { label: 'open', value: 'open' },
          { label: 'close', value: 'close' },
          { label: 'finish', value: 'finish' },
          { label: 'skip', value: 'skip' }
        ],
        multiple: true,
        default: 'open',
        grid: { xs: 'w-full', sm: 'w-full' } }

    ]
  end

  def stats_fields
    [
      add_stat_field(
        name: 'DeliverRateCount',
        label: 'Deliver rate', keys: [
          { name: 'open', color: '#F4F5F7' },
          { name: 'skip', color: '#0747A6' }
        ]
      ),
      add_stat_field(
        name: 'ClickRateCount',
        label: 'Open/Finish rate',
        keys: [
          { name: 'open', color: '#F4F5F7' },
          { name: 'finish', color: '#0747A6' }
        ]
      )
    ]
  end

  def fill_steps
    self.steps = [] if steps.blank?
  end

  def self.broadcast_tour_to_user(user)
    app = user.app
    key = "#{app.key}-#{user.session_id}"

    tours = app.tours.availables_for(user)
    tour = tours.first

    return if tour.blank? || !tour.available_for_user?(user)

    if tours.any?
      MessengerEventsChannel.broadcast_to(key, {
        type: 'tours:receive',
        data: tour.as_json(only: [:id], methods: %i[steps url])
      }.as_json)
    end

    tours.any?
  end
end
