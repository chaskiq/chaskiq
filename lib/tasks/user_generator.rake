

# desc "Explaining what the task does"
 task :terms do
   20.times { App.first.add_user(email: Faker::Internet.unique.email)
 end
