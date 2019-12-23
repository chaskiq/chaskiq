# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.3'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
# gem 'rails', '~> 5.2.0'
gem 'pg'
gem 'rails', '6.0.2' # , github: "rails/rails",

gem 'anycable-rails'
# Use sqlite3 as the database for Active Record
# gem 'sqlite3'
# gem "sqlite3", "~> 1.3.6"
# Use Puma as the app server
gem 'puma', '~> 3.11'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'mini_racer', platforms: :ruby
gem 'haml'

gem 'devise', '4.7.0' # github: "plataformatec/devise"

# Use CoffeeScript for .coffee assets and views
# gem 'coffee-rails', '~> 4.2'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'
# gem 'haml'
# Use Redis adapter to run Action Cable in production
gem 'redis', '~> 4.0'
gem 'redis-namespace', '~> 1.6'
gem 'redis-objects', '~> 1.5'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'
gem 'nightfury', github: 'michelson/nightfury' # "~> 1.0"

# gem 'tabs', github: 'michelson/tabs', branch: "upgrade"

gem 'graphiql-rails', group: :development
gem 'graphql', '~> 1.9'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

gem 'email_reply_trimmer'
# gem 'tunable'
gem 'aasm'
gem 'acts-as-taggable-on', '~> 6.0'
gem 'acts_as_list', '~> 0.9.19'
gem 'deep_cloneable'
gem 'friendly_id', '~> 5.2'
gem 'groupdate'
gem 'gutentag', '~> 2.4'
gem 'pg_search'
gem 'ransack'

gem 'browser', '~> 2.5'
gem 'geocoder', '~> 1.4'

gem 'google-cloud-dialogflow'

gem 'jwe'
gem 'jwt'

gem 'devise-jwt', '~> 0.5.9'
gem 'devise_invitable', '~> 2.0'

gem 'image_processing', '~> 1.2'

gem 'sidekiq'
gem 'sidekiq-cron'
gem 'webpacker', '~> 3.5'

gem 'roadie'
gem 'urlcrypt'

gem 'aws-sdk-s3', '~> 1.15'
gem 'aws-ses'
gem 'mini_magick', '~> 4.8'

gem 'active_importer'
gem 'faraday', '~> 0.15.4'
gem 'http'
gem 'roo'
gem 'ruby-oembed'

gem 'mustache'

gem 'chronic', '~> 0.10.2'
gem 'kaminari', '~> 1.1'

gem 'timezone', '~> 1.2'

gem 'bugsnag', '~> 6.11'
gem 'email_reply_parser', '~> 0.5.9'
gem 'rack-cors', '~> 1.0'

gem 'biz', '~> 1.8'
gem 'i18n-js', '~> 3.3'

gem 'twitter'

gem 'globalize', github: 'globalize/globalize'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false

gem 'dotenv-rails', groups: %i[development test]

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  # gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'cypress-on-rails', '~> 1.0'
  gem 'pry'
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  gem 'capistrano-bundle'
  gem 'capistrano-rails'
  gem 'capistrano-rvm'
  gem 'capistrano-sidekiq'
  gem 'capistrano3-puma'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara' # , '>= 2.15', '< 4.0'
  # gem 'selenium-webdriver'
  gem 'faker', github: 'stympy/faker', group: %i[development test]
  gem 'webdrivers'
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem 'chromedriver-helper'
  gem 'rspec-rails' # , git: 'https://github.com/rspec/rspec-rails', branch: '4-0-dev'
  %w[rspec-core rspec-expectations rspec-mocks rspec-support].each do |lib|
    gem lib # , :git => "https://github.com/rspec/#{lib}.git", :branch => 'master'
  end
  gem 'brakeman'
  gem 'database_cleaner'
  gem 'factory_bot_rails'
  gem 'rubocop', '~> 0.76.0', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'shoulda'
  gem 'shoulda-matchers'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
