class AppIdentity < Nightfury::Identity::Base
  #metric :number_of_users
  #metric :tickets_count, :count_time_series, step: :day
  metric :first_response_time, :avg_time_series, step: :day
end