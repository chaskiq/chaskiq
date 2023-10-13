# frozen_string_literal: true
require 'database_cleaner/active_record'

# DatabaseCleaner.strategy = :truncation
DatabaseCleaner[:active_record].strategy = DatabaseCleaner::ActiveRecord::Truncation.new

# DatabaseCleaner[:redis].strategy = :truncation, { only: ["test:*"] }
# then, whenever you need to clean the DB
begin
  DatabaseCleaner[:active_record].clean
  #ActiveRecord::Tasks::DatabaseTasks.truncate_all
  DatabaseCleaner[:redis].clean
rescue StandardError => e
  sleep 2
  ActiveRecord::Tasks::DatabaseTasks.truncate_all
  #DatabaseCleaner[:active_record].clean_with :deletion
  DatabaseCleaner[:redis].clean_with :deletion
end

{ok: "ok"}
