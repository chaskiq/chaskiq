require 'rails_helper'

RSpec.describe App, type: :model do
  #it{ should have_many(:users).through(:app_users) }
  #it{ should have_many(:conversations) }
  #it{ should have_many(:segments) }
  #it{ should have_many(:roles) }
  #it{ should have_many(:admin_users).through(:roles) }

  let(:app){
    FactoryGirl.create :app
  }

  let(:default_content){
    { 
      "entityMap": {},
      "blocks": [
        { "key": "f1qmb", "text": "", "type": "unstyled", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }, 
      ] 
    }.to_json.to_s
  }

  it "create app" do
    expect(app).to be_valid
    expect(app.key).to be_present
  end

  it "create an user" do 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
    expect(app.app_users.first.first_name).to be_present  
  end

  it "create an agent" do 
    app.add_agent({email: "test@test.cl", first_name: "dsdsa"})
    expect(app.agents).to be_any   
    expect(app.agents.first.first_name).to be_present  
  end

  describe "add anonymous user" do
    it "create with session" do

      app.add_anonymous_user({})
      expect(app.app_users.first.session_id).to be_present  
      expect(app.app_users.last.name).to be_eql "visitor 1"

      app.add_anonymous_user({})
      expect(app.app_users.last.name).to be_eql "visitor 2"
    end
 
  end

  describe "existing user" do 

    before do 
      app.add_user({email: "test@test.cl", first_name: "dsdsa"})
    end

    it "add existing user will keep count but update properties" do 
      app.add_user({email: "test@test.cl", first_name: "edited name"})
      expect(app.reload.app_users.first.first_name).to be == "edited name"
    end

    it "add other user will increase count of app_users" do 
      app.add_user({email: "test@test2.cl", first_name: "edited name"})
      expect(app.reload.app_users.size).to be == 2
      expect(app.reload.app_users.last.first_name).to be == "edited name"
    end

    it "add visit on new user" do
      app.add_visit({email: "foo@bar.org", properties: {browser: "chrome"}})
      expect(app.app_users.size).to be == 2
    end

    it "add visit on existing user" do
      app.add_visit({email: "test@test.cl", properties: {browser: "chrome"}})
      expect(app.app_users.size).to be == 1
      expect(app.app_users.first.properties["browser"]).to be == "chrome"
    end

    describe "other app" do 
      before do 
        @app2 = FactoryGirl.create :app
      end

      it "will update attrs for user on app2 only" do
        @app2.add_user({email: "test@test.cl", properties: {first_name: "edited for app 2"}})
        expect(@app2.app_users.count).to be == 1
        expect(@app2.app_users.last.first_name).to be == "edited for app 2"
        expect(app.app_users.first.first_name).to be == "dsdsa"
        expect(app.app_users.first.email).to be == @app2.app_users.first.email
      end
    end
  end

  it "create_conversation" do
    app_user = app.add_user({email: "test@test.cl", first_name: "dsdsa"})
    conversations = app.start_conversation({
      message: {serialized_content: default_content }, 
      from: app_user
    })
    expect(app.conversations.count).to be == 1
  end


  describe "assigment rules" do

    it "assign rule" do
      role = app.add_agent({email: "test@test.cl", first_name: "dsdsa"})
      agent = role.agent
      app.assignment_rules.create({
        title: "test", 
        agent: agent, 
        conditions: [], 
        priority: 1 
      })

      expect(app.assignment_rules.count).to be == 1
      expect(agent.assignment_rules.count).to be == 1
    end
  end


  describe "agents, availability" do

    before :each do 
      app.add_agent(email: "test@test.cl")
      app.team_schedule = [
        { day: "mon", from: "09:00" , to: '17:00' },
        { day: "tue", from: "09:00" , to: '17:00' },
        { day: "wed", from: "09:00" , to: '17:00' },
        { day: "thu", from: "09:00" , to: '12:00' },
        { day: "thu", from: "13:00" , to: '17:00' },
        { day: "fri", from: "10:00" , to: '14:00' }
      ]
    end

    it "initializes business hours" do
      expect(app.availability).to be_a(Biz::Schedule)
    end

    it "will create agent" do
      expect(app.agents.count).to be == 1
    end

    it "biz time, in time" do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 11, 45)
      expect(app.in_business_hours?(time)).to be_truthy
    end

    it "biz time, out time" do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 17, 45)
      time = time.monday + 4.hours
      expect(app.in_business_hours?(time)).to be_falsey
    end

    it "biz time, out time" do
      # Determine if a time is in business hours
      time = Time.utc(2019, 1, 1, 17, 45)
      time = time.monday + 10.hours
      expect(app.in_business_hours?(time)).to be_falsey
    end

    it "wrong config" do
      app.update(team_schedule: [])
      time = Time.utc(2019, 1, 1, 17, 45)
      time = time.monday + 10.hours
      expect(app.in_business_hours?(time)).to be_nil
    end

  end

end
