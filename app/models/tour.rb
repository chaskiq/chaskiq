# frozen_string_literal: true

require "link_renamer"

class Tour < Message
  validates :scheduled_at, presence: true
  validates :scheduled_to, presence: true
  store_accessor :settings, %i[hidden_constraints url steps]
  before_save :fill_steps

  def config_fields
    [
      { name: "name", type: "string", col: "col-span-6", grid: { xs: "w-full", sm: "w-3/4" } },
      { name: "subject", type: "string", col: "col-span-6", grid: { xs: "w-full", sm: "w-3/4" } },
      { name: "url", type: "string", col: "col-span-6", grid: { xs: "w-full", sm: "w-1/4" } },

      { name: "description", type: "text", col: "col-span-6", grid: { xs: "w-full", sm: "w-full" } },

      { name: "scheduled_at", label: "Scheduled at", type: "datetime", col: "col-span-3", grid: { xs: "w-full", sm: "w-1/2" } },
      { name: "scheduled_to", label: "Scheduled to", type: "datetime", col: "col-span-3", grid: { xs: "w-full", sm: "w-1/2" } },

      { name: "hidden_constraints",
        label: "Hidden constraints",
        type: "select",
        options: [
          %w[open open],
          %w[close close],
          %w[finish finish],
          %w[skip skip]
        ],
        multiple: true,
        default: "open",
        col: "col-span-6",
        grid: { xs: "w-full", sm: "w-full" } }

    ]
  end

  def stats_fields
    [
      add_stat_field(
        name: "DeliverRateCount",
        label: "Deliver rate", keys: [
          { name: "open", color: "#F4F5F7" },
          { name: "skip", color: "#0747A6" }
        ]
      ),
      add_stat_field(
        name: "ClickRateCount",
        label: "Open/Finish rate",
        keys: [
          { name: "open", color: "#F4F5F7" },
          { name: "finish", color: "#0747A6" }
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
      data = {
        type: "tours:receive",
        data: tour.as_json(only: [:id], methods: %i[steps url])
      }.as_json

      MessengerEventsChannel.broadcast_to(key, data)

      tour.broadcast_update_to app, user,
                               target: "chaskiq-custom-events",
                               partial: "messenger/custom_event",
                               locals: { data: data }
    end

    tours.any?
  end

  def steps_objects
    return [] if settings["steps"].blank?

    @steps_objects ||= settings["steps"].map { |o| TourStepForm.new(o) }
  end

  def broadcast_step(step)
    broadcast_append_to self,
                        target: "tour_#{id}",
                        partial: "apps/campaigns/tours/tour_step_item",
                        locals: {
                          index: step.position,
                          step: step,
                          url: Rails.application.routes.url_helpers.tour_step_app_campaign_url(app.key, self, position: step.position)

                        }

    broadcast_update_to self,
                        target: "chaskiq-tours-custom-events",
                        partial: "apps/campaigns/tours/custom_event",
                        locals: { data: step }
  end
end
