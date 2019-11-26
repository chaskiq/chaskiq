require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do

  let!(:app){
    FactoryBot.create(:app)
  }

  let!(:user){
    app.add_user({email: "test@test.cl"})
  }

  let!(:agent_role){
    app.add_agent({email: "test2@test.cl"})
  }


  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  let(:app_user2){ 
    app.add_user({email: "admin@test.cl", first_name: "dsdsa"})
  }

  let!(:conversation){
    app.start_conversation({
      message: {html_content: "message"}, 
      from: app_user,
    }) 
  }

  let(:conversation_from_agent){
    app.start_conversation({
      message: {html_content: "message"}, 
      from: agent_role.agent,
    }) 
  }

  before do
    ActiveJob::Base.queue_adapter = :test
    #ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
    #Rails.application.config.active_job.queue_adapter = :test
  end


  before :each do 
    controller.stub(:current_user).and_return(agent_role.agent)
    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent_role.agent)
  
    Mutations::BaseMutation.any_instance
    .stub(:current_user)
    .and_return(agent_role.agent)

    allow_any_instance_of(GraphqlController).to receive(:authorize_by_jwt).and_return(agent_role.agent)
    controller.instance_variable_set(:@current_agent, agent_role.agent ) 

  
  end


  it "conversations" do

    graphql_post(type: 'CONVERSATIONS', variables: {
      appKey: app.key, 
      page: 1,
      filter: nil,
      sort: nil
    })

    expect(graphql_response.errors).to be_nil
    expect(graphql_response.data.app.conversations.meta).to be_present
    expect(graphql_response.data.app.conversations.collection).to be_any
  end


  it "get unexisting conversation" do

    graphql_post(type: 'CONVERSATION', variables: {
      appKey: app.key, 
      id: "999"
    })

    expect(graphql_response.data.app.conversation).to be_blank
  end

  it "create_conversation" do

    expect(app.conversations.count).to be == 1
    expect(conversation.messages.count).to be == 1
    expect(conversation.assignee).to be_blank

    graphql_post(type: 'CONVERSATION', variables: {
      appKey: app.key, 
      id: conversation.key,
      page: 1
    })

    expect(graphql_response.data.app.conversation).to_not be_blank
    expect(graphql_response.data.app.conversation.messages.meta).to_not be_blank
    expect(graphql_response.data.app.conversation.messages.collection).to be_any
  end

  it "agent add message" do

    #allow_any_instance_of(Mutations::Conversations::InsertComment).to receive(:current_user).and_return(agent_role.agent)

    graphql_post(type: 'INSERT_COMMMENT', variables: {
      appKey: app.key, 
      id: conversation.key,
      message: "<p>helo</p>"
    })
    expect(graphql_response.data.insertComment.message.message).to_not be_blank
  end



end
