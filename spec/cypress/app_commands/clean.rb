# frozen_string_literal: true

# require 'database_cleaner/active_record'
# require 'database_cleaner/redis'

DatabaseCleaner.strategy = :truncation

# DatabaseCleaner[:redis].strategy = :truncation, { only: ["test:*"] }
# then, whenever you need to clean the DB
begin
  DatabaseCleaner.clean
rescue StandardError => e
  sleep 2
  DatabaseCleaner.clean_with :deletion
end
