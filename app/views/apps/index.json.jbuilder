json.collection @apps do |app|
  #json.cache! ['v1', 'index', I18n.locale, artwork.cache_key] do
    json.id app.key
  #end
end