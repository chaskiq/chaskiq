if defined?(DatabaseCleaner)
  attempts = 0
  begin
    # Your existing database cleaning logic
    DatabaseCleaner[:active_record].strategy = DatabaseCleaner::ActiveRecord::Truncation.new
    DatabaseCleaner[:active_record].clean
    DatabaseCleaner[:redis].clean
    DatabaseCleaner.clean
  rescue ActiveRecord::Deadlocked => e
    attempts += 1
    if attempts < 3
      sleep(2) # Sleep for 2 seconds before retrying
      retry
    else
      raise e # Reraise the exception after 3 attempts
    end
  end
else
  logger.warn "add database_cleaner or update cypress/app_commands/clean.rb"
end

CypressOnRails::SmartFactoryWrapper.reload

if defined?(VCR)
  VCR.eject_cassette # make sure we no cassette inserted before the next test starts
  VCR.turn_off!
  WebMock.disable! if defined?(WebMock)
end

Rails.logger.info "APPCLEANED" # used by log_fail.rb
