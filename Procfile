#web: bundle exec rails server -p $PORT
#worker: bundle exec sidekiq -c 5 -v -q mailers,2 -q default
#bin/heroku-worker
worker: bundle exec sidekiq -C config/sidekiq.yml
web: ANYCABLE_REDIS_URL=$REDIS_URL REDIS=$REDIS_URL ADDR="0.0.0.0:$PORT" bin/heroku-web

