#!/usr/bin/env -S falcon host
# frozen_string_literal: true

load :rack

hostname = File.basename(__dir__)
port = ENV["PORT"] || 3000

rack hostname do
  append preload "preload.rb"

  cache false
  verbose true
  count ENV.fetch("RAILS_MAX_THREADS", 5) # ENV.fetch("FALCON_COUNT", 1).to_i
  endpoint Async::HTTP::Endpoint.parse("http://0.0.0.0:#{port}").with(protocol: Async::HTTP::Protocol::HTTP11)
end
