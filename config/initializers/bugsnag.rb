# frozen_string_literal: true

if ENV['BUGSNAG_API_KEY'].present?
  Bugsnag.configure do |config|
    config.api_key = ENV['BUGSNAG_API_KEY']
    config.enabled_release_stages = ['production']
  end
end
