# frozen_string_literal: true

class AppUserDashboard
  attr_accessor :app, :app_user, :range

  # d = Dashboard.new(app: App.find(n) )
  def initialize(app:, range:)
    @app = app
    @range = (DateTime.parse(range[:from])..DateTime.parse(range[:to]))
  end

  def resource
    app.app_users.find(app_user.id)
  end

  def conversations
    resource.conversations.group(:state).count
            .map do |k, v|
      {
        id: k || 'unknown',
        label: k || 'unknown',
        value: v,
        color: "hsl(#{colors}, 70%, 50%)"
      }
    end
  end

  def conversations
    resource.conversations.group(:state).count
            .map do |k, v|
      {
        id: k || 'unknown',
        label: k || 'unknown',
        value: v,
        color: "hsl(#{colors}, 70%, 50%)"
      }
    end
  end

  def visits
    resource.visits
            .all.group_by_day(:created_at)
            .count.map do |o|
      {
        "day": o.first.strftime('%F'),
        "value": o.last
      }
    end
  end

  private

  def colors
    array = %w[265 20 30 110 120 160 260 270 290 330 400]
    array.shuffle.each { |x| }[0]
  end
end
