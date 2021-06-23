# frozen_string_literal: true

source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "2.7.2"

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem "pg"
gem "rails", "6.1.3.1" # , github: "rails/rails",

gem "anycable-rails"
# Use sqlite3 as the database for Active Record
# gem 'sqlite3'
# gem "sqlite3", "~> 1.3.6"
# Use Puma as the app server
gem "puma", "~> 5.3"
# Use SCSS for stylesheets
gem "sass-rails", "~> 5.0"
# Use Uglifier as compressor for JavaScript assets
gem "uglifier", ">= 1.3.0"
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'mini_racer', platforms: :ruby
gem "haml"

gem "devise", "4.7.1" # github: "plataformatec/devise"

# Use CoffeeScript for .coffee assets and views
# gem 'coffee-rails', '~> 4.2'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem "turbolinks", "~> 5"
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem "jbuilder"
# gem 'haml'
# Use Redis adapter to run Action Cable in production
gem "redis", "~> 4.0"
gem "redis-namespace", "~> 1.8"
gem "redis-objects", "~> 1.5"
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'
gem "nightfury", github: "michelson/nightfury" # "~> 1.0"

# gem 'tabs', github: 'michelson/tabs', branch: "upgrade"

gem "action_policy-graphql", "~> 0.4"
gem "goldiloader"
gem "graphiql-rails", group: :development
gem "graphql"

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

gem "email_reply_trimmer"
# gem 'tunable'
gem "aasm"
gem "acts_as_list", "~> 0.9.19"
gem "acts-as-taggable-on", github: "mbleigh/acts-as-taggable-on"
gem "deep_cloneable"
gem "friendly_id", "~> 5.2"
gem "groupdate"
gem "pg_search"
gem "ransack"

gem "browser", "~> 2.5"
gem "geocoder", "~> 1.6"
gem "geoip"
gem "truemail"

gem "google-cloud-dialogflow"

gem "jwe"
gem "jwt"

# AUTH
# gem 'devise-jwt', '~> 0.5.9'
gem "devise_invitable", "~> 2.0"
gem "doorkeeper", "~> 5.4"
gem "oauth", "~> 0.5.5"
gem "omniauth-oauth2"

gem "image_processing", "~> 1.2"
gem "sidekiq"
gem "sidekiq-cron"
gem "webpacker", "~> 5.0"

gem "emoji_data", github: "chaskiq/emoji_data.rb"
gem "roadie"
gem "roadie-rails"
gem "urlcrypt"

gem "aws-sdk-s3", "~> 1.48"
# gem 'aws-ses'
# https://github.com/drewblas/aws-ses/issues/78
gem "aws-sdk-rails"
gem "mini_magick", "~> 4.8"

gem "active_importer"
gem "faraday"
gem "http"
gem "roo"
gem "ruby-oembed"

gem "mustache"

gem "chronic", "~> 0.10.2"
gem "kaminari", "~> 1.2"

gem "timezone", "~> 1.2"

gem "bugsnag" # , '~> 6.11'
gem "email_reply_parser", "~> 0.5.9"
gem "rack-cors", "~> 1.0"

gem "biz", "~> 1.8"
gem "i18n-js"

gem "globalize", github: "globalize/globalize"

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", ">= 1.1.0", require: false

gem "dotenv-rails", groups: %i[development test]

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  # gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem "cypress-on-rails", "~> 1.0"
  gem "pry"
end

group :development do
  gem "rack-mini-profiler", "~> 2.0"
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem "listen", ">= 3.0.5", "< 3.2"
  gem "web-console", ">= 3.3.0"
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem "spring"
end

group :test do
  gem "faker", github: "stympy/faker", group: %i[development test]
  gem "rspec-rails" # , git: 'https://github.com/rspec/rspec-rails', branch: '4-0-dev'
  %w[rspec-core rspec-expectations rspec-mocks rspec-support].each do |lib|
    gem lib # , :git => "https://github.com/rspec/#{lib}.git", :branch => 'master'
  end
  gem "brakeman"
  gem "code-scanning-rubocop", require: false
  gem "database_cleaner-active_record"
  gem "database_cleaner-redis"
  gem "factory_bot_rails"
  gem "rubocop", require: false
  gem "rubocop-performance", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "shoulda"
  gem "shoulda-matchers"
  gem "webmock"
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "php_serialize", "~> 1.2"
gem "scout_apm", "~> 2.6"
gem "tzinfo-data", platforms: %i[mingw mswin x64_mingw jruby]
