require 'rails_helper'


RSpec.describe UserAutoMessage, type: :model do

  include ActiveJob::TestHelper

  let(:app){
    FactoryGirl.create :app
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

  let(:campaign){ FactoryGirl.create(:user_auto_message, app: app) }
  let(:premailer_template){"<p>
    {{name}} {{last_name}} {{email}} 
    {{campaign_url}} {{campaign_subscribe}} 
    {{campaign_unsubscribe}}this is the template
    <a href='http://google.com'>google.com</a>
    </p>"}

  describe "creation" do
    it "will create a pending campaign by default" do
      @c = FactoryGirl.create(:user_auto_message, app: app)
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

      @c = FactoryGirl.create(:user_auto_message, 
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
      @c.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to be_blank
    end

    it "get collection will return any" do
      @c.enable!
      @c.hidden_constraints = ["viewed"]
      @c.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to be_blank
    end

    it "template compilation" do
      notification = @c.show_notification_for(subscriber)
      allow_any_instance_of(UserAutoMessage).to receive(:html_content).and_return(premailer_template)
      html = @c.mustache_template_for(subscriber)
      expect(html).to be_include("click?r=http://google.com")
    end

  end

=begin
  context "send newsletter" do
    before do

      10.times do
        app.add_user(email: Faker::Internet.email, properties: { 
          custom_country: "albania"
        })
      end

      app.segments.create

      @c = FactoryGirl.create(:campaign, 
        app: app, 
        segments: app.segments.first.predicates
      )

      allow(@c).to receive(:premailer).and_return("<p>hi</p>")
      allow_any_instance_of(Campaign).to receive(:apply_premailer).and_return(true)
    end

    it "will prepare mail to" do
      expect(@c.prepare_mail_to(subscription)).to be_an_instance_of(ActionMailer::MessageDelivery)
    end

    it "will prepare mail to can send inline" do
      reset_email
      @c.prepare_mail_to(subscription).deliver_now
      expect(ActionMailer::Base.deliveries.size).to be 1
    end

    it "will send newsletter jobs for each subscriber" do
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 0
      MailSenderJob.perform_now(@c)
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 10
    end

    it "will send newsletter jobs for each subscriber" do
      app.app_users.first.unsubscribe!
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 0
      MailSenderJob.perform_now(@c)
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 9
    end

    it "will send newsletter for dispatch" do
      app.app_users.first.unsubscribe!
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 0
      @c.send_newsletter
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq 1
    end

  end

  context "template compilation" do

    it "will render subscriber attributes" do
      campaign.html_content = html_content
      campaign.save
      expect(campaign.html_content).to be == html_content
      allow_any_instance_of(Campaign).to receive(:premailer).and_return("{{name}}")
      expect(campaign.mustache_template_for(subscriber)).to include(subscriber.name)
    end
  end

  context "clone campaign" do
    it "should clone record" do
      c = campaign.clone_newsletter
      c.save
      expect(c.id).to_not be == campaign.id
      # expect(c.template).to be == campaign.template
      # expect(c.list).to be == campaign.list
      expect(c.subscribers).to be == campaign.subscribers
    end

    it "rename" do
      c = campaign.clone_newsletter
      c.save
      expect(c.name).to_not be == campaign.name
      expect(c.name).to include("copy")
    end

  end
=end

end

