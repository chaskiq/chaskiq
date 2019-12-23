# frozen_string_literal: true

class VisitCollector
  attr_accessor :user

  def initialize(user:)
    self.user = user
  end

  def update_browser_data(options)
    user_options = options.select { |k, _v| user.respond_to?(k) }
    user_options.merge!(referrer: options['url'])
    !add_web_sessions.empty? && user_options.merge!(add_web_sessions)
    user.update(user_options)
    user.visits.create(options)
  end

  def add_web_sessions
    options = {}

    if user.first_seen.blank?
      options.merge!(
        first_seen: Time.zone.now
      )
    end

    options.merge!(
      last_seen: Time.zone.now
    )

    if user.last_visited_at.blank?
      return options.merge!(
        web_sessions: user.web_sessions.to_i + 1,
        last_visited_at: Time.zone.now
      )
    end

    # last visited more than 30 minutes
    diff = (Time.zone.now - user.last_visited_at) / 60

    if diff >= 30
      options.merge!(
        web_sessions: user.web_sessions.to_i + 1,
        last_visited_at: Time.zone.now
      )
    end

    options
  end
end
