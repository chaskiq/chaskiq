require 'rails_helper'

RSpec.describe GraphqlController, type: :controller do

  let!(:app){
    FactoryGirl.create(:app)
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
      message: "message", 
      from: app_user,
    }) 
  }

  let(:conversation_from_agent){
    app.start_conversation({
      message: "message", 
      from: agent_role.agent,
    }) 
  }


  before :each do 
    controller.stub(:current_user).and_return(agent_role.agent)
    allow_any_instance_of(Types::BaseObject).to receive(:current_user).and_return(agent_role.agent)
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
      id: 999
    })

    expect(graphql_response.errors).to be_present
  end

  it "create_conversation" do

    expect(app.conversations.count).to be == 1
    expect(conversation.messages.count).to be == 1
    expect(conversation.assignee).to be_present

    graphql_post(type: 'CONVERSATION', variables: {
      appKey: app.key, 
      id: conversation.id,
      page: 1
    })

    expect(graphql_response.data.app.conversation).to_not be_blank
    expect(graphql_response.data.app.conversation.messages.meta).to_not be_blank
    expect(graphql_response.data.app.conversation.messages.collection).to be_any
  end

  it "agent add message" do

    allow_any_instance_of(Mutations::Conversations::InsertComment).to receive(:current_user).and_return(agent_role.agent)

    graphql_post(type: 'INSERT_COMMMENT', variables: {
      appKey: app.key, 
      id: conversation.id,
      message: "<p>helo</p>"
    })

    expect(graphql_response.data.insertComment.message.message).to_not be_blank
  end



end