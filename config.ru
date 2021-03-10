# frozen_string_literal: true

# This file is used by Rack-based servers to start the application.

require_relative 'config/environment'

require_relative 'lib/rack/health_check'

map '/health' do
  run Rack::HealthCheck.new
end

run Rails.application
