def stub_current_user(user)
  controller.stub(:current_user).and_return(user.agent)
  controller.stub(:api_authorize!).and_return(user.agent)
  allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(user.agent)

  Mutations::BaseMutation.any_instance
                         .stub(:current_user)
                         .and_return(user.agent)

  allow_any_instance_of(GraphqlController).to receive(:doorkeeper_authorize!).and_return(user.agent)
  controller.instance_variable_set(:@current_agent, user.agent) 
end