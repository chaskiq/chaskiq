# frozen_string_literal: true

json.collection @app_users, partial: 'app_users/app_user', as: :app_user

json.meta do
  json.current_page(@app_users.current_page)
  json.next_page((begin
                       @app_users.next_page
                  rescue StandardError
                    0
                     end).to_s)
  json.prev_page((begin
                       @app_users.prev_page
                  rescue StandardError
                    0
                     end).to_s)
  json.total_pages(@app_users.total_pages)
  json.total_count(@app_users.total_count)
end
