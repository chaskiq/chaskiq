# frozen_string_literal: true

# The recommended approach is to use a ConnectionPool since
# this guarantees that most timeouts in the redis client do not pollute
# your existing connection. However, you need to make sure that both
# :timeout and :size are set appropriately in a multithreaded environment.

require 'connection_pool'
Redis::Objects.redis = ConnectionPool.new(size: 5, timeout: 5) do
  Redis.new(url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/1' })
end
# Redis::Objects can also default to Redis.current if Redis::Objects.redis is not set.

# Redis.current = Redis.new(:host => '127.0.0.1', :port => 6379)
