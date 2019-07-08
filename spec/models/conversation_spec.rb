require 'rails_helper'

RSpec.describe Conversation, type: :model do
  #it{ should have_many :messages}
  #it{ should belong_to :app}

  let(:app){ FactoryGirl.create :app}
  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  let(:app_user2){ 
    app.add_user({email: "admin@test.cl", first_name: "dsdsa"})
  }

  let!(:agent_role){
    app.add_agent({email: "agent1@test.cl"})
  }

  let!(:agent_role2){
    app.add_agent({email: "agent2@test.cl"})
  }

  let(:assignment_rule){

    ->(rules) {
      app.assignment_rules.create({
        title: "test", 
        agent: agent_role2.agent, 
        conditions: rules || [], 
        priority: 1 
      })
    }
  }

  it "create_conversation from app user" do
    app.start_conversation({
      message: {text_content: "aa"}, 
      from: app_user
    })
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
    expect(app.conversations.first.assignee).to be_blank
  end

  it "create_conversation from agent" do
    app.start_conversation({
      message: {text_content: "aa"}, 
      from: agent_role.agent,
      participant: app_user
    })
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
    expect(app.conversations.first.assignee).to be_present
  end

  context "add message" do

    subject(:conversation){
      app.start_conversation({
        message: {text_content: "aa"}, 
        from: app_user
      })
    }

    it "add message" do
      expect(conversation.events.count).to be == 1
      expect(conversation.messages.count).to be == 1
      expect(ConversationsChannel).to receive(:broadcast_to)
      expect_any_instance_of(ConversationPart).to receive(:enqueue_email_notification)
      message = conversation.add_message({
        from: app_user,
        message: {text_content: "aa"}
      })
      expect(message).to be_persisted
    end

  end

  context "add private message" do

    subject(:conversation){
      app.start_conversation({
        message: {text_content: "aa"}, 
        from: app_user
      })
    }
    
    it "add message" do
      expect(conversation.messages.count).to be == 1
      expect(ConversationsChannel).to_not receive(:broadcast_to)
      expect_any_instance_of(ConversationPart).to_not receive(:enqueue_email_notification)

      message = conversation.add_private_note({
        from: app_user,
        message: {text_content: "aa"}
      })
      expect(message).to be_persisted
      expect(conversation.messages.count).to be == 2
    end

  end


  context "close conversation" do

    subject(:conversation){
      app.start_conversation({
        message: {text_content: "aa"}, 
        from: app_user
      })
    }

    it "register event on close & reopen" do
      conversation.close
      expect(conversation.events.count).to be == 2
      expect(conversation.events.last.action).to be == Event.action_for(:conversation_closed)
      conversation.reopen
      expect(conversation.events.last.action).to be == Event.action_for(:conversation_reopened)
    end

  end


  context "assignment rule from new conversation initiated by app user" do

    it "will assign agent 2 with empty conditions" do
      assignment_rule[[]]
      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      serialized = "{\"blocks\":
      [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
      \"entityMap\":{}}"

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end

    it "content not eq rule" do

      serialized = "{\"blocks\":
      [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
      \"entityMap\":{}}"

      assignment_rule[[{
        "type"=>"string", 
        "value"=>"foobar", 
        "attribute"=>"message_content", 
        "comparison"=>"not_eq"}
      ]]

      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be_blank
    end

    it "content eq rule" do

      serialized = "{\"blocks\":[{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"

      assignment_rule[[{
        "type"=>"string", 
        "value"=>"foobar", 
        "attribute"=>"message_content", 
        "comparison"=>"eq"}
      ],

      ]

      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end

    it "content eq rule match any" do

      serialized = "{\"blocks\":[{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"


      assignment_rule[
        [
          {
            "type"=>"match", 
            "attribute"=>"match", 
            "comparison"=>"or", 
            "value"=>"or"
          },
          {
            "type"=>"string", 
            "value"=>"foobar", 
            "attribute"=>"message_content", 
            "comparison"=>"eq"
          },
          {
            "type"=>"string", 
            "value"=>"baaz", 
            "attribute"=>"message_content", 
            "comparison"=>"eq"
          }
        ]
      ]

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be == agent_role2.agent

    end


    it "content eq rule match any" do

      serialized = "{\"blocks\":[{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"

      assignment_rule[
        [
          {
            "type"=>"match", 
            "attribute"=>"match", 
            "comparison"=>"and", 
            "value"=>"and"
          },
          {
            "type"=>"string", 
            "value"=>"foobar", 
            "attribute"=>"message_content", 
            "comparison"=>"eq"
          },
          {
            "type"=>"string", 
            "value"=>"baaz", 
            "attribute"=>"message_content", 
            "comparison"=>"eq"
          }
        ]
      ]

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be_blank

    end

    it "content eq rule match any" do

      serialized = "{\"blocks\":[{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"

      assignment_rule[
        [
          {
            "type"=>"match", 
            "attribute"=>"match", 
            "comparison"=>"or", 
            "value"=>"or"
          },
          {
            "type"=>"string", 
            "value"=> app_user.email, 
            "attribute"=>"email", 
            "comparison"=>"eq"
          },
          {
            "type"=>"string", 
            "value"=> "baaz", 
            "attribute"=>"message_content", 
            "comparison"=>"eq"
          }
        ]
      ]

      app.start_conversation({
        message: {text_content: "aa", serialized_content: serialized}, 
        from: app_user
      })
      expect(app.conversations.first.assignee).to be == agent_role2.agent

    end

    

  end



end