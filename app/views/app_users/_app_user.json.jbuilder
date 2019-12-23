# frozen_string_literal: true

json.id              app_user.id
json.email           app_user.email
json.last_visited_at app_user.last_visited_at
json.referrer        app_user.referrer
json.state           app_user.state
json.ip              app_user.ip
json.city            app_user.city
json.region          app_user.region
json.country         app_user.country
json.lat             app_user.lat.to_f
json.lng             app_user.lng.to_f
json.postal          app_user.postal
json.web_sessions    app_user.web_sessions
json.timezone        app_user.timezone
json.browser         app_user.browser
json.browser_version app_user.browser_version
json.os              app_user.os
json.os_version      app_user.os_version
json.browser_language app_user.browser_language
json.lang             app_user.lang
