# frozen_string_literal: true

require "rails_helper"

RSpec.describe Campaign, type: :model do
  include ActiveJob::TestHelper

  # it{ should have_many :attachments }
  # it{ should have_many :metrics }
  # it{ should have_one :campaign_template }
  # it{ should have_one(:template).through(:campaign_template) }
  # it{ should belong_to :list }
  # it{ should have_many(:subscribers).through(:list) }
  # it{ should belong_to :template }

  let(:app) do
    FactoryBot.create :app
  end

  let(:html_content)  do
    "<p>hola {{name}} {{email}}</p> <a href='http://google.com'>google</a>"
  end
  # let(:template){ FactoryBot.create(:chaskiq_template, body: html_content ) }
  # let(:list){ FactoryBot.create(:chaskiq_list) }
  let(:subscriber) do
    app.add_user(email: Faker::Internet.email, properties: {
                   custom_country: "albania",
                   name: Faker::Name.unique.name
                 })
  end

  let(:subscription) do
    app.app_users.first
  end

  let(:campaign) { FactoryBot.create(:campaign, app: app) }
  let(:premailer_template) { "<p>{{name}} {{last_name}} {{email}} {{campaign_url}} {{campaign_subscribe}} {{campaign_unsubscribe}}this is the template</p>" }

  describe "creation" do
    it "will create a pending campaign by default" do
      @c = FactoryBot.create(:campaign, app: app)
      expect(@c).to_not be_sent
      allow_any_instance_of(Campaign).to receive(:premailer).and_return(premailer_template)
    end
  end

  context "template step" do
    # it "will copy template" do
    #  #campaign.template = template
    #  campaign.save
    # expect(campaign.html_content).to be == template.body
    # end

    # it "will copy template on creation" do
    #  expect(campaign.html_content).to be == template.body
    # end
  end

  context "send newsletter" do
    before do
      10.times do
        app.add_user(email: Faker::Internet.email, properties: {
                       custom_country: "albania"
                     })
      end

      app.segments.create

      @c = FactoryBot.create(:campaign,
                             app: app,
                             segments: app.segments.first.predicates)

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
      count = ActiveJob::Base.queue_adapter.enqueued_jobs.size
      MailSenderJob.perform_now(@c)
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq(count + 10)
    end

    it "will send newsletter jobs for each subscriber" do
      app.app_users.first.unsubscribe!
      count = ActiveJob::Base.queue_adapter.enqueued_jobs.size
      MailSenderJob.perform_now(@c)
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq count + 9
    end

    it "will send newsletter for dispatch" do
      app.app_users.first.unsubscribe!
      count = ActiveJob::Base.queue_adapter.enqueued_jobs.size
      @c.send_newsletter
      expect(ActiveJob::Base.queue_adapter.enqueued_jobs.size).to eq count + 1
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

  context "email address" do
    it "campaign address finds compaigns" do
      expect(campaign.campaign_outgoing_email).to_not be_blank
      c = Campaign.decode_email(campaign.campaign_outgoing_email)
      expect(c.id).to be_eql(campaign.id)
    end

    it "campaign address, a hacky one" do
      expect(campaign.campaign_outgoing_email).to_not be_blank
      address = campaign.campaign_outgoing_email
      c = Campaign.decode_email(address.gsub("campaigns+", "campaigns+xxxx"))
      expect(c).to be_nil
    end
  end
end
