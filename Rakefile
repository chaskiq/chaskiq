# frozen_string_literal: true

# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require_relative "config/application"

Rails.application.load_tasks

namespace :locales do
  desc "compile i18n before compile"
  task build: :environment do
    system("yarn i18n:export")
  end
end

# Run yarn i18n:export prior to assets precompilation, so i18n json are available for use.
# Rake::Task['assets:precompile'].enhance [ 'locales:build' ]
