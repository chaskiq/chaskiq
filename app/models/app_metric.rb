class AppMetric < ApplicationRecord
  belongs_to :app

  scope :last_month, -> { where("created_at > ?", 1.month.ago) }
  scope :last_week, -> { where("created_at > ?", 1.week.ago) }
  scope :last_hour, -> { where("created_at > ?", 1.hour.ago) }
  scope :yesterday, -> { where("DATE(created_at) = ?", 1.day.ago.to_date) }
  scope :today, -> { where("DATE(created_at) = ?", Date.today) }

  scope :first_response_time, -> { where(kind: "first_response_time") }
  scope :incoming_messages, -> { where(kind: "incoming_messages") }
  scope :outgoing_messages, -> { where(kind: "outgoing_messages") }
  scope :opened_conversations, -> { where(kind: "opened_conversations") }
  scope :solved_conversations, -> { where(kind: "solved_conversations") }
  scope :resolution_avg, -> { where(kind: "resolution_avg") }
  scope :visits, -> { where(kind: "visits") }
  scope :visitors, -> { where(kind: "visitors") }
  scope :new_leads, -> { where(kind: "new_leads") }
  scope :new_users, -> { where(kind: "new_users") }

  scope :avg_ss, -> { where(kind: "avg_ss") }

  scope :per_minute, -> { time_bucket("1 minute") }
  scope :per_hour, -> { time_bucket("1 hour") }
  scope :per_day, -> { time_bucket("1 day") }
  scope :per_week, -> { time_bucket("1 week") }
  scope :per_month, -> { time_bucket("1 month") }

  scope :time_bucket,
        lambda { |time_dimension, value: "count(1)"|
          select(<<~SQL.squish).group("time, app_id").order("app_id, time")
            time_bucket('#{time_dimension}', created_at) as time, app_id,
            #{value} as value
          SQL
        }

  scope :average_response_time_per_minute,
        -> { time_bucket("1 minute", value: "avg(value)") }
  scope :worst_response_time_last_minute,
        -> { time_bucket("1 minute", value: "max(value)") }
end
