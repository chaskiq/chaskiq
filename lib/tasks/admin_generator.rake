# desc "Explaining what the task does"
task admin_generator: :environment do
  app = App.first
  if app.app_users.find_by(email: ENV['ADMIN_EMAIL']).nil?
    app.add_admin(Agent.create(
                    email: ENV['ADMIN_EMAIL'],
                    password: ENV['ADMIN_PASSWORD']
                  ))
  end
end
