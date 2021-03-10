desc 'Generates a default admin'
task admin_generator: :environment do
  app = App.first
  app.add_admin({
                  email: ENV['ADMIN_EMAIL'],
                  password: ENV['ADMIN_PASSWORD']
                })
end
