# frozen_string_literal: true

json.app do
  json.name        @app.name
  json.key         @app.key
  json.encryption_key @app.encryption_key
  json.preferences @app.preferences
  json.segments    @segments
  json.state @app.state
  json.domain_url @app.domain_url
  json.config_fields @app.config_fields
  json.active_messenger @app.active_messenger
  json.preferences @app.preferences
  json.tagline @app.tagline
  json.theme @app.theme
end
