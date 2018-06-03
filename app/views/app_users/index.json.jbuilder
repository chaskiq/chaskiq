json.collection @app_users do |app|
  #json.cache! ['v1', 'index', I18n.locale, artwork.cache_key] do
    json.email app.user.email
    json.last_visited_at app.last_visited_at
    json.properties app.properties
    json.state app.state
  #end
end