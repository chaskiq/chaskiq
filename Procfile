#web: bundle exec rails server -p $PORT
#worker: bundle exec sidekiq -c 5 -v -q mailers,2 -q default

worker: bin/heroku-worker
web: ANYCABLE_REDIS_URL=$REDIS_URL REDIS=$REDIS_URL ADDR="0.0.0.0:$PORT" CABLE_URL='wss://anycable-chaskiq-rpc.herokuapp.com/cable' bin/heroku-web

