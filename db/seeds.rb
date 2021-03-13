# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'app_packages_catalog'

domain = ENV['HOST'] || 'http://localhost:3000'

AppPackagesCatalog.update_all unless Rails.env.test?

app = App.create(
  name: 'test app',
  domain_url: domain
)

Doorkeeper::Application.create(
  name: 'authapp'
  # redirect_uri: "#{domain}/callback"
)
