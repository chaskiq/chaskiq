# frozen_string_literal: true

# The recommended approach is to use a ConnectionPool since
# this guarantees that most timeouts in the redis client do not pollute
# your existing connection. However, you need to make sure that both
# :timeout and :size are set appropriately in a multithreaded environment.


# `Redis#exists(key)` will return an Integer in redis-rb 4.3. `exists?` 
# returns a boolean, you should use it instead. To opt-in to the new 
# behavior now you can set Redis.exists_returns_integer =  true. 
# To disable this message and keep the current (boolean) behaviour of 'exists' 
# you can set `Redis.exists_returns_integer = false`, 
# but this option will be removed in 5.0. (gems/redis-namespace-1.6.0/lib/redis/namespace.rb:442:in `call_with_namespace')
Redis.exists_returns_integer =  true

require 'connection_pool'
Redis::Objects.redis = ConnectionPool.new(size: 5, timeout: 5) do
  Redis.new(url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/1' })
end
# Redis::Objects can also default to Redis.current if Redis::Objects.redis is not set.

# Redis.current = Redis.new(:host => '127.0.0.1', :port => 6379)
