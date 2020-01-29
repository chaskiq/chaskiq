# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAutoMessage, type: :model do
  include ActiveJob::TestHelper

  let(:app) do
    FactoryBot.create :app
  end

  let(:html_content)  do
    "<p>hola {{name}} {{email}}</p> <a href='http://google.com'>google</a>"
  end

  let(:subscriber) do
    app.add_user(email: Faker::Internet.email, properties: {
                   custom_country: 'albania',
                   name: Faker::Name.unique.name
                 })
  end

  let(:subscription) do
    app.app_users.first
  end

  let(:campaign) { 
    FactoryBot.create(:user_auto_message, app: app) 
  }

  let(:premailer_template) do
    "<p>
    {{name}} {{last_name}} {{email}}
    {{campaign_url}} {{campaign_subscribe}}
    {{campaign_unsubscribe}}this is the template
    <a href='http://google.com'>google.com</a>
    </p>"
  end

  describe 'creation' do
    it 'will create a pending campaign by default' do
      @c = FactoryBot.create(:user_auto_message, app: app)
      expect(@c).to_not be_sent
      allow_any_instance_of(UserAutoMessage).to receive(:html_content).and_return(premailer_template)
    end
  end

  describe 'trigger message detection' do

    let!(:users_segment){
      10.times do
        app.add_user(email: Faker::Internet.email, properties: {
                       custom_country: 'albania'
                     })
      end

      app.segments.create
    }

    let(:message){
      FactoryBot.create(:user_auto_message,
      app: app,
      segments: app.segments.first.predicates,
      scheduled_at: 2.day.ago,
      scheduled_to: 30.days.from_now)
    }

    before :each do 
      UserAutoMessage.destroy_all
    end

    it 'detect by predicates' do
      expect(message.available_for_user?(subscriber)).to be_present
    end

    it 'display message will create metric' do
      message.show_notification_for(subscriber)
      expect(message.metrics).to be_any
    end

    it 'get collection will return any' do
      message.enable!
      expect(UserAutoMessage.availables_for(subscriber)).to be_any
    end

    it 'get collection will return any' do
      message.enable!
      message.hidden_constraints = ['viewed']
      message.save
      message.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to be_blank
    end

    it 'get collection will return any on no hidden constraints' do
      message.enable!
      message.show_notification_for(subscriber)
      expect(UserAutoMessage.availables_for(subscriber)).to_not be_blank
    end

    it 'template compilation' do
      notification = message.show_notification_for(subscriber)
      allow_any_instance_of(UserAutoMessage).to receive(:html_content).and_return(premailer_template)
      html = message.mustache_template_for(subscriber)
      expect(html).to be_include('click?r=http://google.com')
    end
  end
end
