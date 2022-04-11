desc "Generates a default admin"
task admin_generator: :environment do
  app = App.first
  app.add_admin({
                  email: Chaskiq::Config.get("ADMIN_EMAIL"),
                  password: Chaskiq::Config.get("ADMIN_PASSWORD")
                })
end
