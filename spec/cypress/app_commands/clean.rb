if defined?(DatabaseCleaner)
  # cleaning the database using database_cleaner
  DatabaseCleaner.strategy = :truncation
  DatabaseCleaner.clean
else
  logger.warn "add database_cleaner or update clean_db"
  Post.delete_all if defined?(Post)
end

Rails.logger.info "APPCLEANED" # used by log_fail.rb
