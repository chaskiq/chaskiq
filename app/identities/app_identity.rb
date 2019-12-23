# frozen_string_literal: true

class AppIdentity < Nightfury::Identity::Base
  # metric :number_of_users
  metric :first_response_time, :avg_time_series, step: :day
  metric :incoming_messages, :count_time_series, step: :day
  metric :outgoing_messages, :count_time_series, step: :day
  metric :opened_conversations, :count_time_series, step: :day
  metric :solved_conversations, :count_time_series, step: :day
  metric :resolution_avg, :avg_time_series, step: :day
  metric :visits, :count_time_series, step: :day
  metric :visitors, :count_time_series, step: :day
  metric :new_leads, :count_time_series, step: :day
  metric :new_users, :count_time_series, step: :day
end
