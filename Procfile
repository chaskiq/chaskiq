web: bundle exec rails server -p $PORT
worker: bundle exec sidekiq -c 5 -v -q mailers,2 -q default
