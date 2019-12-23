# frozen_string_literal: true

json.collection @apps do |app|
  # json.cache! ['v1', 'index', I18n.locale, artwork.cache_key] do
  json.id app.key
  json.name        app.name
  json.key         app.key
  json.state       app.state
  # end
end
