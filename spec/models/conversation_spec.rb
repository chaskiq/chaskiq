# frozen_string_literal: true

require 'rails_helper'

require 'app_packages_catalog'
include ActiveJob::TestHelper

RSpec.describe Conversation, type: :model do
  # it{ should have_many :messages}
  # it{ should belong_to :app}

  let(:app) { FactoryBot.create :app }
  let(:app_user) do
    app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
  end

  let(:app_user2) do
    app.add_user(email: 'admin@test.cl', first_name: 'dsdsa')
  end

  let!(:agent_role) do
    app.add_agent(email: 'agent1@test.cl')
  end

  let!(:agent_role2) do
    app.add_agent(email: 'agent2@test.cl')
  end

  let(:assignment_rule) do
    lambda { |rules|
      app.assignment_rules.create(
        title: 'test',
        agent: agent_role2.agent,
        conditions: rules || [],
        priority: 1
      )
    }
  end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = false
    # Rails.application.config.active_job.queue_adapter = :test

    #  ActiveJob::Base.queue_adapter = :sidekiq
    #  ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  before :each do
    AppIdentity.new(app.key).delete
  end

  it 'create_conversation from app user' do
    app.start_conversation(
      message: { text_content: 'aa' },
      from: app_user
    )
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
    expect(app.conversations.first.assignee).to be_blank

    expect(app.stats_for('opened_conversations')).to be_present
  end

  it 'adds counters zero for user' do
    app_user.new_messages.value = 0

    app.start_conversation(
      message: { text_content: 'aa' },
      from: app_user
    )

    c = app.conversations.first

    expect(c.main_participant.new_messages.value).to be == 0

    c.messages.first.notify_read!

    expect(c.main_participant.new_messages.value).to be == 0
  end

  it 'create_conversation from agent' do
    app.start_conversation(
      message: { text_content: 'aa' },
      from: agent_role.agent,
      participant: app_user
    )
    expect(app.conversations.count).to be == 1
    expect(app.conversations.first.messages.count).to be == 1
    expect(app.conversations.first.assignee).to be_present

    expect(app.stats_for('opened_conversations')).to be_present
  end

  it 'assign event does not trigger counter' do
    app_user.new_messages.value = 0

    app.start_conversation(
      message: { text_content: 'aa' },
      from: agent_role.agent,
      participant: app_user
    )
    conversation = app.conversations.first
    main_participant = conversation.main_participant

    expect(app.conversations.count).to be == 1
    expect(main_participant.new_messages.value).to be == 1

    conversation.assign_user(agent_role2.agent)
    expect(conversation.messages.size).to be == 2
    expect(main_participant.new_messages.value).to be == 1
  end

  context 'add message' do
    subject(:conversation) do
      app.start_conversation(
        message: { text_content: 'aa' },
        from: app_user
      )
    end

    it 'add message' do

      #expect(conversation.events.count).to be == 1
      expect(conversation.messages.count).to be == 1

      message = conversation.messages.last

      expect(EventsChannel).to receive(:broadcast_to)

      expect(MessengerEventsChannel).to receive(:broadcast_to).with(
        message.broadcast_key,
        hash_including(type: 'conversations:conversation_part')
      )

      expect(MessengerEventsChannel).to receive(:broadcast_to).with(
        message.broadcast_key,
        hash_including(type: 'conversations:unreads')
      )

      # expect_any_instance_of(ConversationPart).to receive(:enqueue_email_notification)
      message = conversation.add_message(
        from: app_user,
        message: { text_content: 'aa' }
      )
      expect(message).to be_persisted
    end

    it 'add block message' do
      #expect(conversation.events.count).to be == 1
      expect(conversation.messages.count).to be == 1
      expect(EventsChannel).to receive(:broadcast_to)

      message = conversation.messages.last

      expect(MessengerEventsChannel).to receive(:broadcast_to).with(
        message.broadcast_key,
        hash_including(type: 'conversations:conversation_part')
      )

      expect(MessengerEventsChannel).to receive(:broadcast_to).with(
        message.broadcast_key,
        hash_including(type: 'conversations:unreads')
      )

      expect_any_instance_of(ConversationPart).to receive(:enqueue_email_notification)
      message = conversation.add_message(
        from: app_user,
        controls: { a: 1 }
      )
      expect(message).to be_persisted
      expect(message.message[:blocks]).to be_present
    end
  end

  context 'add private message' do
    subject(:conversation) do
      app.start_conversation(
        message: { text_content: 'aa' },
        from: app_user
      )
    end

    it 'add message' do
      expect(conversation.messages.count).to be == 1
      # expect(ConversationsChannel).to_not receive(:broadcast_to)
      expect_any_instance_of(ConversationPart).to_not receive(:enqueue_email_notification)

      message = conversation.add_private_note(
        from: app_user,
        message: { text_content: 'this is a private note' }
      )
      expect(message).to be_persisted
      expect(conversation.messages.count).to be == 2
    end
  end

  context 'close conversation' do
    subject(:conversation) do
      app.start_conversation(
        message: { text_content: 'aa' },
        from: app_user
      )
    end

    it 'register event on close & reopen' do
      expect(app.stats_for('solved_conversations')).to be_blank
      conversation.close

      expect(app.stats_for('opened_conversations')).to be_present
      expect(app.stats_for('solved_conversations')).to be_present

      expect(app.stats_for('resolution_avg')).to be_present

      events = conversation.events.pluck(:action) & ["conversations.closed", "conversations.started", "conversations.added"]
      expect(events.size).to be == 3

      expect(conversation.events.last.action).to be == Event.action_for(:conversation_closed)
      conversation.reopen
      expect(conversation.events.last.action).to be == Event.action_for(:conversation_reopened)
    end
  end

  context 'assignment rule from new conversation initiated by app user' do
    it 'will assign agent 2 with empty conditions' do
      assignment_rule[[]]
      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      serialized = "{\"blocks\":
      [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
      \"entityMap\":{}}"

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end

    it 'content not eq rule' do
      serialized = "{\"blocks\":
      [{\"key\":\"bl82q\",\"text\":\"foobar\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],
      \"entityMap\":{}}"

      assignment_rule[[{
        'type' => 'string',
        'value' => 'foobar',
        'attribute' => 'message_content',
        'comparison' => 'not_eq'
      }]]

      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be_blank
    end

    it 'content eq rule' do
      serialized = '{"blocks":[{"key":"bl82q","text":"foobar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'

      assignment_rule[[{
        'type' => 'string',
        'value' => 'foobar',
        'attribute' => 'message_content',
        'comparison' => 'eq'
      }],
      ]

      expect(app.assignment_rules.count).to be == 1
      expect(agent_role.agent.assignment_rules).to be_empty
      expect(agent_role2.agent.assignment_rules.count).to be_present

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end

    it 'content eq rule match any' do
      serialized = '{"blocks":[{"key":"bl82q","text":"foobar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'

      assignment_rule[
        [
          {
            'type' => 'match',
            'attribute' => 'match',
            'comparison' => 'or',
            'value' => 'or'
          },
          {
            'type' => 'string',
            'value' => 'foobar',
            'attribute' => 'message_content',
            'comparison' => 'eq'
          },
          {
            'type' => 'string',
            'value' => 'baaz',
            'attribute' => 'message_content',
            'comparison' => 'eq'
          }
        ]
      ]

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end

    it 'content eq rule match any' do
      serialized = '{"blocks":[{"key":"bl82q","text":"foobar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'

      assignment_rule[
        [
          {
            'type' => 'match',
            'attribute' => 'match',
            'comparison' => 'and',
            'value' => 'and'
          },
          {
            'type' => 'string',
            'value' => 'foobar',
            'attribute' => 'message_content',
            'comparison' => 'eq'
          },
          {
            'type' => 'string',
            'value' => 'baaz',
            'attribute' => 'message_content',
            'comparison' => 'eq'
          }
        ]
      ]

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be_blank
    end

    it 'content eq rule match any' do
      serialized = '{"blocks":[{"key":"bl82q","text":"foobar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}'

      assignment_rule[
        [
          {
            'type' => 'match',
            'attribute' => 'match',
            'comparison' => 'or',
            'value' => 'or'
          },
          {
            'type' => 'string',
            'value' => app_user.email,
            'attribute' => 'email',
            'comparison' => 'eq'
          },
          {
            'type' => 'string',
            'value' => 'baaz',
            'attribute' => 'message_content',
            'comparison' => 'eq'
          }
        ]
      ]

      app.start_conversation(
        message: { text_content: 'aa', serialized_content: serialized },
        from: app_user
      )
      expect(app.conversations.first.assignee).to be == agent_role2.agent
    end
  end


  let!(:app_package) do
    #definitions = [
    #  {
    #    name: 'access_token_secret',
    #    type: 'string',
    #    grid: { xs: 12, sm: 12 }
    #  }
    #]

    fields = AppPackagesCatalog.packages.find{|o| o[:name] == "Slack"}

    AppPackage.create(fields)
    #name: 'Slack', definitions: definitions
    #)
  end

  context 'app package integration' do

    before :each do
      @pkg = app.app_package_integrations.create(
        api_secret: "aaa",
        api_key: "aaa",
        access_token: "aaa",
        access_token_secret: "aaa",
        app_package: app_package
      )
      app_user
    end


    it "create conversation will call slack app" do
      expect_any_instance_of(MessageApis::Slack).to receive(:trigger).with(any_args)
      perform_enqueued_jobs do
        app.start_conversation(
          message: { text_content: 'aa' },
          from: app_user
        )
      end
      expect(app.conversations.count).to be == 1
    end
  end
end
