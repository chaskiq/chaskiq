json.collection @app_users do |app|
  #json.cache! ['v1', 'index', I18n.locale, artwork.cache_key] do
    json.email app.user.email
    json.properties app.properties
    json.state app.state
  #end
end