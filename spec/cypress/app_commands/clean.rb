# frozen_string_literal: true

if defined?(DatabaseCleaner)
  # cleaning the database using database_cleaner
  DatabaseCleaner.strategy = :truncation
  DatabaseCleaner.clean
   # see https://github.com/bmabey/database_cleaner/issues/99
  begin
    ActiveRecord::Base.connection.send :rollback_transaction_records, true
  rescue
  end
else
  logger.warn 'add database_cleaner or update clean_db'
  Post.delete_all if defined?(Post)
end

Rails.logger.info 'APPCLEANED' # used by log_fail.rb
