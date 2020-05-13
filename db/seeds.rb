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

app = App.create(
   name: 'test app', 
   domain_url: domain
)

app.add_admin(Agent.create(
                email: 'admin@test.com',
                password: '123456'
              ))

Doorkeeper::Application.create(
   name: "authapp", 
   #redirect_uri: "#{domain}/callback"
)

AppPackagesCatalog.import unless Rails.env.test?
