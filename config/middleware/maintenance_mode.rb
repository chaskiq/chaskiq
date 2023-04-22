# config/middleware/maintenance_mode.rb

module Middleware
  class MaintenanceMode
    def initialize(app)
      @app = app
    end

    def call(env)
      [200, { 'Content-Type' => 'text/html' }, [File.read(Rails.root.join('public', 'maintenance.html'))]]
    end
  end
end