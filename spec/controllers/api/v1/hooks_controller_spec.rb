require 'rails_helper'

def send_data(params)
  @request.env['RAW_POST_DATA'] = params.to_json
  post :create
end

RSpec.describe Api::V1::HooksController, type: :controller do
  #routes { Engine.routes }
  
  let(:app){ FactoryGirl.create(:app) }
  let(:subscriber){
    app.add_user(email: Faker::Internet.email, properties: { 
          custom_country: "albania",
          name: Faker::Name.unique.name 
        })
  }

  let(:campaign){ FactoryGirl.create(:campaign, app: app) }

  let(:metric){
    FactoryGirl.create(:metric, 
      campaign: campaign, 
      trackable: subscriber
    )
  }

  let(:bounce_sns){
     {"Message" => {
           "notificationType"=>"Bounce",
           "bounce"=>{
              "bounceType"=>"Permanent",
              "bounceSubType"=> "General",
              "bouncedRecipients"=>[
                 {
                    "emailAddress"=>"#{subscriber.email}"
                 },
                 {
                    "emailAddress"=>"recipient2@example.com"
                 }
              ],
              "timestamp"=>"2012-05-25T14:59:38.237-07:00",
              "feedbackId"=>"00000137860315fd-869464a4-8680-4114-98d3-716fe35851f9-000000"
           },
           "mail"=>{
              "timestamp"=>"2012-05-25T14:59:38.237-07:00",
              "messageId"=>"00000137860315fd-34208509-5b74-41f3-95c5-22c1edc3c924-000000",
              "source"=>"#{campaign.from_email}",
              "destination"=>[
                 "recipient1@example.com",
                 "recipient2@example.com",
                 "recipient3@example.com",
                 "recipient4@example.com"
              ]
          }
        }.to_json
      }
  }

  let(:complaint_sns){
    {"Message" => {
        "notificationType"=>"Complaint",
        "complaint"=>{
           "complainedRecipients"=>[
              {
                 "emailAddress"=>"#{subscriber.email}"
              }
           ],
           "timestamp"=>"2012-05-25T14:59:38.613-07:00",
           "feedbackId"=>"0000013786031775-fea503bc-7497-49e1-881b-a0379bb037d3-000000"
        },
        "mail"=>{
           "timestamp"=>"2012-05-25T14:59:38.613-07:00",
           "messageId"=>"0000013786031775-163e3910-53eb-4c8e-a04a-f29debf88a84-000000",
           "source"=>"#{campaign.from_email}",
           "destination"=>[
              "recipient1@example.com",
              "recipient2@example.com",
              "recipient3@example.com",
              "recipient4@example.com"
           ]
        }
      }.to_json
    }
  }

  it "will set a bounce" do
    inline_job do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(bounce_sns)
      expect(response.status).to be == 200
      expect(campaign.metrics.bounces.size).to be == 1
    end
  end

  it "will set a spam metric and unsubscribe user" do
    inline_job do
      ActiveJob::Base.queue_adapter = :inline
      allow(Metric).to receive(:find_by).and_return(metric)

      campaign
      response = send_data(complaint_sns)
      expect(response.status).to be == 200
      expect(campaign.metrics.spams.size).to be == 1
      expect(subscriber.reload).to be_unsubscribed
    end
  end
end