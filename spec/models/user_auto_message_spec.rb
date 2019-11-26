require 'rails_helper'


RSpec.describe UserAutoMessage, type: :model do

  include ActiveJob::TestHelper

  let(:app){
    FactoryBot.create :app
  }

  let(:html_content){
    "<p>hola {{name}} {{email}}</p> <a href='http://google.com'>google</a>"
  }

  let(:subscriber){
    app.add_user(email: Faker::Internet.email, properties: { 
          custom_country: "albania",
          name: Faker::Name.unique.name 
        })
  }

  let(:subscription){
    app.app_users.first
  }

  let(:campaign){ FactoryBot.create(:user_auto_message, app: app) }
  let(:premailer_template){"<p>
    {{name}} {{last_name}} {{email}} 
    {{campaign_url}} {{campaign_subscribe}} 
    {{campaign_unsubscribe}}this is the template
    <a href='http://google.com'>google.com</a>
    </p>"}

  describe "creation" do
    it "will create a pending campaign by default" do
      @c = FactoryBot.create(:user_auto_message, app: app)
      expect(@c).to_not be_sent
      allow_any_instance_of(UserAutoMessage).to receive(:html_content).and_return(premailer_template)
    end
  end

  describe "trigger message detection" do
    before do
      10.times do
        app.add_user(email: Faker::Internet.email, properties: { 
          custom_country: "albania"
        })
      end

      app.segments.create

      @c = FactoryBot.create(:user_auto_message, 
        app: app, 
        segments: app.segments.first.predicates,
        scheduled_at: 2.day.ago,
        scheduled_to: 30.days.from_now
      )
    end

    it "detect by predicates" do
      expect(@c.available_for_user?(subscriber.id)).to be_present
    end

    it "display message will create metric" do
      @c.show_notification_for(subscriber)
      expect(@c.metrics).to be_any
    end

    it "get collection will return any" do
      @c.enable!
      expect(UserAutoMessage.availables_for(subscriber)).to be_any
    end

    it "get collection will return any" do
      @c.enable!
      @c.hidden_constraints = ["viewed"]
      @c.save
      @c.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to be_blank
    end

    it "get collection will return any on no hidden constraints" do
      @c.enable!
      @c.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to_not be_blank
    end

    it "template compilation" do
      notification = @c.show_notification_for(subscriber)
      allow_any_instance_of(UserAutoMessage).to receive(:html_content).and_return(premailer_template)
      html = @c.mustache_template_for(subscriber)
      expect(html).to be_include("click?r=http://google.com")
    end

  end

end

