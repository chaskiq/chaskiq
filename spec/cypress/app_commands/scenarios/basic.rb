app = FactoryBot.create(:app, encryption_key: "unodostrescuatro",
          active_messenger: "true",
          state: 'enabled')

agent = app.add_agent({email: "test@test.cl", name: "sharleena"})
#user = app.add_user({email: "test@test.cl"})
