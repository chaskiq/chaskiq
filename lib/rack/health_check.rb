# Your Ruby Rack App that returns your Rails App's Health
# Create the file
# "lib/rack/health_check.rb"
# from https://medium.com/@goncalvesjoao/how-to-have-a-working-health-endpoint-while-rails-is-500ring-509efc1da42c

module Rack
  class  HealthCheck
    def call(env)
      status = {
        redis: {
          connected: redis_connected
        },
        postgres: {
          connected: postgres_connected,
          migrations_updated: postgres_migrations_updated
        }
      }

      return [503, {}, [status.to_json]] if !redis_connected || !postgres_connected

      return [200, {}, [status.to_json]]
    end

    protected

    def redis_connected
      Redis.current.ping == 'PONG' rescue false
    end

    def postgres_connected
      begin
        ApplicationRecord.establish_connection
        ApplicationRecord.connection
        ApplicationRecord.connected?
      rescue
        false
      end
    end

    def postgres_migrations_updated
      return false unless postgres_connected

      !ApplicationRecord.connection.migration_context.needs_migration?
    end
  end
end