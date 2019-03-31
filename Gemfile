source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.5.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
#gem 'rails', '~> 5.2.0'
gem "rails", "6.0.0.beta3" #, github: "rails/rails",
gem 'pg'
# Use sqlite3 as the database for Active Record
#gem 'sqlite3'
# Use Puma as the app server
gem 'puma', '~> 3.11'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'mini_racer', platforms: :ruby

gem 'devise', '4.6.2' #github: "plataformatec/devise"

# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
gem 'haml'
# Use Redis adapter to run Action Cable in production
gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use ActiveStorage variant
# gem 'mini_magick', '~> 4.8'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

gem 'email_reply_trimmer'
# gem 'tunable'
#gem 'acts_as_taggable_on'
gem 'aasm'
gem 'sidekiq'
gem 'sidekiq-cron'
gem 'webpacker', '~> 3.5'
gem 'gutentag', '~> 2.4'
gem 'roadie'
gem "urlcrypt"
gem "groupdate"
gem "deep_cloneable"
gem "aws-ses"
gem "aws-sdk-sns", ">= 1.9.0", require: false
gem "ransack"
gem "active_importer"
gem "roo"
gem "ruby-oembed"
gem "http"
gem "mustache"



# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  #gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'pry'
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  #gem 'capistrano-rails'
  #gem 'capistrano3-puma'
  #gem 'capistrano-rvm'
  #gem 'capistrano-bundle'
  #gem 'capistrano-sidekiq'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 2.15', '< 4.0'
  gem 'selenium-webdriver'
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem 'chromedriver-helper'


  gem 'rspec-rails', git: 'https://github.com/rspec/rspec-rails', branch: '4-0-dev'

  %w[rspec-core rspec-expectations rspec-mocks rspec-support].each do |lib|
    gem lib, :git => "https://github.com/rspec/#{lib}.git", :branch => 'master'
  end
  gem 'factory_girl_rails'
  gem 'database_cleaner'
  gem 'shoulda'
  gem 'shoulda-matchers'
  gem 'faker', github: "stympy/faker"

end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Added at 2018-05-30 20:31:10 -0400 by michelson:
gem "kaminari", "~> 1.1"

# Added at 2018-06-02 21:08:21 -0400 by michelson:
gem "chronic", "~> 0.10.2"

# Added at 2018-06-04 09:34:22 -0400 by michelson:
gem "geocoder", "~> 1.4"

# Added at 2018-06-04 20:46:01 -0400 by michelson:
gem "browser", "~> 2.5"

# Added at 2018-06-04 20:57:37 -0400 by michelson:
gem "timezone", "~> 1.2"

# Added at 2018-06-28 01:37:19 -0400 by michelson:
gem "mini_magick", "~> 4.8"

# Added at 2018-06-28 02:13:52 -0400 by michelson:
gem "aws-sdk-s3", "~> 1.15"
