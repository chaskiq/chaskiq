# frozen_string_literal: true

require 'rails_helper'

RSpec.describe App, type: :model do
  # it{ should have_many(:users).through(:app_users) }
  # it{ should have_many(:conversations) }
  # it{ should have_many(:segments) }
  # it{ should have_many(:roles) }
  # it{ should have_many(:admin_users).through(:roles) }

  let(:app) do
    FactoryBot.create :app
  end

  let(:default_content) do
    {
      "entityMap": {},
      "blocks": [
        { "key": 'f1qmb', "text": '', "type": 'unstyled', "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }
      ]
    }.to_json.to_s
  end

  it 'create app' do
    expect(app).to be_valid
    expect(app.key).to be_present
    expect(app.agent_bots).to be_present
  end

  it 'create an user' do
    app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
    expect(app.app_users.users).to be_any
  end

  it 'create an agent' do
    app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'})
    app.reload
    expect(app.agents).to be_any
    expect( app.agents.find_by(email: "test@test.cl").first_name ).to be_present
  end

  it 'crean an agent bot' do
    app.add_bot_agent(email: 'agent@chaskiq.cl', first_name: 'bot')
    expect(app.agent_bots).to be_any
  end

  describe 'add anonymous user' do
    it 'add visitor' do
      app.add_anonymous_user({})
      expect(app.app_users.visitors).to be_any
    end

    it 'create with session' do
      app.add_anonymous_user({})
      expect(app.app_users.first.session_id).to be_present
      first_user_name = app.app_users.last.name
      expect(first_user_name).to include('visitor')

      app.add_anonymous_user({})
      last_user_name = app.app_users.last.name
      expect(last_user_name).to include('visitor')

      expect(last_user_name).to_not be == first_user_name
    end
  end

  describe 'existing user' do
    before do
      app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
    end

    it 'add existing user will keep count but update properties' do
      app.add_user(email: 'test@test.cl', first_name: 'edited name')
      expect(app.reload.app_users.first.first_name).to be == 'edited name'
    end

    it 'add other user will increase count of app_users' do
      app.add_user(email: 'test@test2.cl', first_name: 'edited name')
      expect(app.reload.app_users.size).to be == 2
      expect(app.reload.app_users.last.first_name).to be == 'edited name'
    end

    it 'add visit on new user' do
      app.add_visit(email: 'foo@bar.org', properties: { browser: 'chrome' })
      expect(app.app_users.size).to be == 2
    end

    it 'add visit on existing user' do
      app.add_visit(email: 'test@test.cl', properties: { browser: 'chrome' })
      expect(app.app_users.size).to be == 1
      expect(app.app_users.first.browser).to be == 'chrome'
    end

    describe 'other app' do
      before do
        @app2 = FactoryBot.create :app
      end

      it 'will update attrs for user on app2 only' do
        @app2.add_user(email: 'test@test.cl', properties: { first_name: 'edited for app 2' })
        expect(@app2.app_users.count).to be == 1
        expect(@app2.app_users.last.first_name).to be == 'edited for app 2'
        expect(app.app_users.first.first_name).to be == 'dsdsa'
        expect(app.app_users.first.email).to be == @app2.app_users.first.email
      end
    end
  end

  it 'create_conversation' do
    app_user = app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
    agent1 = app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'}).agent
    agent2 = app.add_agent({email: 'test2@test.cl', first_name: 'dsdsa'}).agent
    conversations = app.start_conversation(
      message: { serialized_content: default_content },
      from: app_user
    )
    expect(app.conversations.count).to be == 1
    expect(conversations.assignee).to be_blank
  end

  it 'create_conversation assignee override' do
    app_user = app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
    agent1 = app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'}).agent
    agent2 = app.add_agent({email: 'test2@test.cl', first_name: 'dsdsa'}).agent

    conversations = app.start_conversation(
      assignee: agent2,
      message: { serialized_content: default_content },
      from: app_user
    )
    expect(app.conversations.count).to be == 1
    expect(conversations.assignee.id).to be == agent2.id
  end

  describe 'assignment rules' do
    it 'assign rule' do
      role = app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'})
      agent = role.agent
      app.assignment_rules.create(
        title: 'test',
        agent: agent,
        conditions: [],
        priority: 1
      )

      expect(app.assignment_rules.count).to be == 1
      expect(agent.assignment_rules.count).to be == 1
    end
  end

  describe 'agents, availability' do
    before :each do
      app.add_agent({email: 'test@test.cl'})
      app.team_schedule = [
        { day: 'mon', from: '09:00', to: '17:00' },
        { day: 'tue', from: '09:00', to: '17:00' },
        { day: 'wed', from: '09:00', to: '17:00' },
        { day: 'thu', from: '09:00', to: '12:00' },
        { day: 'thu', from: '13:00', to: '17:00' },
        { day: 'fri', from: '10:00', to: '14:00' }
      ]
      app.timezone = 'UTC'
      app.save
    end

    it 'initializes business hours' do
      expect(app.availability).to be_a(Biz::Schedule)
    end

    it 'will create agent' do
      expect(app.agents.count).to be == 2
    end

    it 'biz time, in time' do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 11, 45)
      expect(app.in_business_hours?(time)).to be_truthy
    end

    it 'biz time, out time' do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 17, 45)
      expect(app.in_business_hours?(time)).to be_falsey
    end

    it 'biz time, out time' do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 17, 45)
      expect(app.in_business_hours?(time)).to be_falsey
    end

    it 'wrong config' do
      app.update(team_schedule: [])
      time = Time.utc(2019, 1, 1, 17, 45)
      time = time.monday + 10.hours
      expect(app.in_business_hours?(time)).to be_nil
    end

    it 'next week' do
      app.update(team_schedule: [
                   { day: 'tue', from: '01:00', to: '01:30' }
                 ])
      time = Time.utc(2019, 9, 3, 17, 45)
      expect(time.day).to be == 3
      expect(app.in_business_hours?(time)).to be_falsey

      expect(app.availability.time(0, :hours).after(time).day).to be == 10
    end

    it 'same week' do
      app.update(team_schedule: [
                   { day: 'tue', from: '01:00', to: '01:30' }
                 ])
      time = Time.utc(2019, 9, 3, 1, 0o5)
      expect(time.day).to be == 3
      expect(app.in_business_hours?(time)).to be_truthy
      expect(app.availability.time(0, :hours).after(time).day).to be == 3
    end

    it 'tomorrow' do
      app.update(team_schedule: [
                   { day: 'tue', from: '01:00', to: '01:30' },
                   { day: 'wed', from: '01:00', to: '01:30' }
                 ])

      time = Time.utc(2019, 9, 3, 1, 35)
      expect(time.day).to be == 3
      expect(app.in_business_hours?(time)).to be_falsey
      expect(app.availability.time(0, :hours).after(time).day).to be == 4
    end

    it 'in the next hours' do
      app.update(team_schedule: [
                   { day: 'tue', from: '01:00', to: '01:30' }
                 ])
      time = Time.utc(2019, 9, 3, 0, 50)
      expect(time.day).to be == 3
      expect(app.in_business_hours?(time)).to be_falsey
      expect(app.availability.time(0, :hours).after(time).day).to be == 3
    end
  end

  def setting_for_user(user_options: [], visitor_options: [])
    settings = {
      'enabled' => false,
      'users' => { 'enabled' => true, 'segment' => 'all', 'predicates' => user_options },
      'visitors' => { 'enabled' => true, 'segment' => 'all', 'predicates' => visitor_options }
    }
    app.update(inbound_settings: settings)
  end

  describe 'inbound settings segments' do
    before :each do
      app.add_user(email: 'test@test.cl', first_name: 'dsdsa')
    end

    it 'return for user user' do
      user_options = [{ "attribute": 'email', "comparison": 'contains', "type": 'string', "value": 'test' }]
      setting_for_user(user_options: user_options)
      expect(app.query_segment('users')).to be_any
    end

    it 'no return for user' do
      user_options = [{ "attribute": 'email', "comparison": 'not_contains', "type": 'string', "value": 'test' }]
      setting_for_user(user_options: user_options)
      expect(app.query_segment('users')).to_not be_any
    end

    it 'return for visitor ' do
      visitor_options = [{ "attribute": 'email', "comparison": 'contains', "type": 'string', "value": 'test' }]
      setting_for_user(visitor_options: visitor_options)
      expect(app.query_segment('visitors')).to be_any
    end

    it 'no return for visitors' do
      visitor_options = [{ "attribute": 'email', "comparison": 'not_contains', "type": 'string', "value": 'test' }]
      setting_for_user(visitor_options: visitor_options)
      expect(app.query_segment('visitors')).to_not be_any
    end
  end
end
