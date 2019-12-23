# frozen_string_literal: true

namespace :webpacker do
  desc 'analyzes webpacker bundles, it will open localhost:8080'
  task :analyze do
    system 'ANALIZE_BUNDLE=true NODE_ENV=production bin/webpack'
  end
end
