# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require_relative "./seeds/app_packages_catalog.rb"

#app = App.create(name: "test app")
#app.add_admin(Agent.create(email: "miguelmichelson@gmail.com", password: "123456"))



AppPackagesCatalog.import