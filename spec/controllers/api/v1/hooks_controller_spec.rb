# frozen_string_literal: true

require 'rails_helper'
# https://docs.aws.amazon.com/ses/latest/DeveloperGuide/monitor-sending-using-notifications.html
def send_data(params)
  post :create, body: params.to_json
end

RSpec.describe Api::V1::HooksController, type: :controller do
  # routes { Engine.routes }

  let(:app) { FactoryBot.create(:app) }
  let(:subscriber) do
    app.add_user(email: Faker::Internet.email, properties: {
                   custom_country: 'albania',
                   name: Faker::Name.unique.name
                 })
  end

  let(:campaign) { FactoryBot.create(:campaign, app: app) }

  let(:metric) do
    FactoryBot.create(:metric,
                      trackable: campaign,
                      app_user: subscriber)
  end

  let(:conversation) do
    app.start_conversation(
      message: { text_content: 'aa' },
      from: subscriber
    )
  end

  let(:bounce_sns) do
    { 'Message' => {
      'notificationType' => 'Bounce',
      'bounce' => {
        'bounceType' => 'Permanent',
        'bounceSubType' => 'General',
        'bouncedRecipients' => [
          {
            'emailAddress' => subscriber.email.to_s
          },
          {
            'emailAddress' => 'recipient2@example.com'
          }
        ],
        'timestamp' => '2012-05-25T14:59:38.237-07:00',
        'feedbackId' => '00000137860315fd-869464a4-8680-4114-98d3-716fe35851f9-000000'
      },
      'mail' => {
        'timestamp' => '2012-05-25T14:59:38.237-07:00',
        'messageId' => '00000137860315fd-34208509-5b74-41f3-95c5-22c1edc3c924-000000',
        'source' => campaign.from_email.to_s,
        'destination' => [
          'recipient1@example.com',
          'recipient2@example.com',
          'recipient3@example.com',
          'recipient4@example.com'
        ]
      }
    }.to_json }
  end

  let(:complaint_sns) do
    { 'Message' => {
      'notificationType' => 'Complaint',
      'complaint' => {
        'complainedRecipients' => [
          {
            'emailAddress' => subscriber.email.to_s
          }
        ],
        'timestamp' => '2012-05-25T14:59:38.613-07:00',
        'feedbackId' => '0000013786031775-fea503bc-7497-49e1-881b-a0379bb037d3-000000'
      },
      'mail' => {
        'timestamp' => '2012-05-25T14:59:38.613-07:00',
        'messageId' => '0000013786031775-163e3910-53eb-4c8e-a04a-f29debf88a84-000000',
        'source' => campaign.from_email.to_s,
        'destination' => [
          'recipient1@example.com',
          'recipient2@example.com',
          'recipient3@example.com',
          'recipient4@example.com'
        ]
      }
    }.to_json }
  end

  # configuration set sns events
  let(:delivery_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
      "eventType": "Delivery",
      "mail": {
        "timestamp": "2016-10-19T23:20:52.240Z",
        "source": "sender@example.com",
        "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
        "sendingAccountId": "123456789012",
        "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "destination": [
          "recipient@example.com"
        ],
        "headersTruncated": false,
        "headers": [
          {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
          {
            "name": "From",
            "value": "sender@example.com"
          },
          {
            "name": "To",
            "value": "recipient@example.com"
          },
          {
            "name": "Subject",
            "value": "Message sent from Amazon SES"
          },
          {
            "name": "MIME-Version",
            "value": "1.0"
          },
          {
            "name": "Content-Type",
            "value": "text/html; charset=UTF-8"
          },
          {
            "name": "Content-Transfer-Encoding",
            "value": "7bit"
          }
        ],
        "commonHeaders": {
          "from": [
            "sender@example.com"
          ],
          "to": [
            "recipient@example.com"
          ],
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject": "Message sent from Amazon SES"
        },
        "tags": {
          "ses:configuration-set": [
            "ConfigSet"
          ],
          "ses:source-ip": [
            "192.0.2.0"
          ],
          "ses:from-domain": [
            "example.com"
          ],
          "ses:caller-identity": [
            "ses_user"
          ],
          "ses:outgoing-ip": [
            "192.0.2.0"
          ],
          "myCustomTag1": [
            "myCustomTagValue1"
          ],
          "myCustomTag2": [
            "myCustomTagValue2"
          ]
        }
      },
      "delivery": {
        "timestamp": "2016-10-19T23:21:04.133Z",
        "processingTimeMillis": 11893,
        "recipients": [
          "recipient@example.com"
        ],
        "smtpResponse": "250 2.6.0 Message received",
        "reportingMTA": "mta.example.com"
      }
    }' }
  end

  let(:complaint_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
      "eventType":"Complaint",
      "complaint": {
        "complainedRecipients":[
          {
            "emailAddress":"recipient@example.com"
          }
        ],
        "timestamp":"2017-08-05T00:41:02.669Z",
        "feedbackId":"01000157c44f053b-61b59c11-9236-11e6-8f96-7be8aexample-000000",
        "userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36",
        "complaintFeedbackType":"abuse",
        "arrivalDate":"2017-08-05T00:41:02.669Z"
      },
      "mail":{
        "timestamp":"2017-08-05T00:40:01.123Z",
        "source":"Sender Name <sender@example.com>",
        "sourceArn":"arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
        "sendingAccountId":"123456789012",
        "messageId":"EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "destination":[
          "recipient@example.com"
        ],
        "headersTruncated":false,
        "headers":[
          {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
          {
            "name":"From",
            "value":"Sender Name <sender@example.com>"
          },
          {
            "name":"To",
            "value":"recipient@example.com"
          },
          {
            "name":"Subject",
            "value":"Message sent from Amazon SES"
          },
          {
            "name":"MIME-Version","value":"1.0"
          },
          {
            "name":"Content-Type",
            "value":"multipart/alternative; boundary=\"----=_Part_7298998_679725522.1516840859643\""
          }
        ],
        "commonHeaders":{
          "from":[
            "Sender Name <sender@example.com>"
          ],
          "to":[
            "recipient@example.com"
          ],
          "messageId":"EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject":"Message sent from Amazon SES"
        },
        "tags":{
          "ses:configuration-set":[
            "ConfigSet"
          ],
          "ses:source-ip":[
            "192.0.2.0"
          ],
          "ses:from-domain":[
            "example.com"
          ],
          "ses:caller-identity":[
            "ses_user"
          ]
        }
      }
    }' }
  end

  let(:send_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
      "eventType": "Send",
      "mail": {
        "timestamp": "2016-10-14T05:02:16.645Z",
        "source": "sender@example.com",
        "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
        "sendingAccountId": "123456789012",
        "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "destination": [
          "recipient@example.com"
        ],
        "headersTruncated": false,
        "headers": [
          {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
          {
            "name": "From",
            "value": "sender@example.com"
          },
          {
            "name": "To",
            "value": "recipient@example.com"
          },
          {
            "name": "Subject",
            "value": "Message sent from Amazon SES"
          },
          {
            "name": "MIME-Version",
            "value": "1.0"
          },
          {
            "name": "Content-Type",
            "value": "multipart/mixed;  boundary=\"----=_Part_0_716996660.1476421336341\""
          },
          {
            "name": "X-SES-MESSAGE-TAGS",
            "value": "myCustomTag1=myCustomTagValue1, myCustomTag2=myCustomTagValue2"
          }
        ],
        "commonHeaders": {
          "from": [
            "sender@example.com"
          ],
          "to": [
            "recipient@example.com"
          ],
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject": "Message sent from Amazon SES"
        },
        "tags": {
          "ses:configuration-set": [
            "ConfigSet"
          ],
          "ses:source-ip": [
            "192.0.2.0"
          ],
          "ses:from-domain": [
            "example.com"
          ],
          "ses:caller-identity": [
            "ses_user"
          ],
          "myCustomTag1": [
            "myCustomTagValue1"
          ],
          "myCustomTag2": [
            "myCustomTagValue2"
          ]
        }
      },
      "send": {}
    }' }
  end

  let(:open_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
      "eventType": "Open",
      "mail": {
        "commonHeaders": {
          "from": [
            "sender@example.com"
          ],
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject": "Message sent from Amazon SES",
          "to": [
            "recipient@example.com"
          ]
        },
        "destination": [
          "recipient@example.com"
        ],
        "headers": [
          {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
          {
            "name": "X-SES-CONFIGURATION-SET",
            "value": "ConfigSet"
          },
          {
            "name": "From",
            "value": "sender@example.com"
          },
          {
            "name": "To",
            "value": "recipient@example.com"
          },
          {
            "name": "Subject",
            "value": "Message sent from Amazon SES"
          },
          {
            "name": "MIME-Version",
            "value": "1.0"
          },
          {
            "name": "Content-Type",
            "value": "multipart/alternative; boundary=\"XBoundary\""
          }
        ],
        "headersTruncated": false,
        "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "sendingAccountId": "123456789012",
        "source": "sender@example.com",
        "tags": {
          "ses:caller-identity": [
            "ses-user"
          ],
          "ses:configuration-set": [
            "ConfigSet"
          ],
          "ses:from-domain": [
            "example.com"
          ],
          "ses:source-ip": [
            "192.0.2.0"
          ]
        },
        "timestamp": "2017-08-09T21:59:49.927Z"
      },
      "open": {
        "ipAddress": "192.0.2.1",
        "timestamp": "2017-08-09T22:00:19.652Z",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60"
      }
    }' }
  end


  let(:open_sns_event_with_part) do

    crypt         = URLcrypt.encode("#{app.id}+#{conversation.id}")
    from_email    = "messages+#{crypt}@#{app.outgoing_email_domain}"

    { 'Type' => 'Notification',
      'Message' => '{
      "eventType": "Open",
      "mail": {
        "commonHeaders": {
          "from": [
            "sender@example.com"
          ],
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject": "Message sent from Amazon SES",
          "to": [
            "recipient@example.com"
          ]
        },
        "destination": [
          "recipient@example.com"
        ],
        "headers": [
          {"name": "Message-ID",
             "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"
          },
          { "name": "Return-Path", 
            "value": "'+from_email+'"
          },
          {
            "name": "X-SES-CONFIGURATION-SET",
            "value": "ConfigSet"
          },

          {
            "name": "X-CHASKIQ-PART-ID",
            "value": "'+conversation.messages.last.id.to_s+'"
          },
          {
            "name": "From",
            "value": "sender@example.com"
          },
          {
            "name": "To",
            "value": "recipient@example.com"
          },
          {
            "name": "Subject",
            "value": "Message sent from Amazon SES"
          },
          {
            "name": "MIME-Version",
            "value": "1.0"
          },
          {
            "name": "Content-Type",
            "value": "multipart/alternative; boundary=\"XBoundary\""
          }
        ],
        "headersTruncated": false,
        "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "sendingAccountId": "123456789012",
        "source": "sender@example.com",
        "tags": {
          "ses:caller-identity": [
            "ses-user"
          ],
          "ses:configuration-set": [
            "ConfigSet"
          ],
          "ses:from-domain": [
            "example.com"
          ],
          "ses:source-ip": [
            "192.0.2.0"
          ]
        },
        "timestamp": "2017-08-09T21:59:49.927Z"
      },
      "open": {
        "ipAddress": "192.0.2.1",
        "timestamp": "2017-08-09T22:00:19.652Z",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60"
      }
    }' }
  end

  let(:click_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
      "eventType": "Click",
      "click": {
        "ipAddress": "192.0.2.1",
        "link": "http://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-smtp.html",
        "linkTags": {
          "samplekey0": [
            "samplevalue0"
          ],
          "samplekey1": [
            "samplevalue1"
          ]
        },
        "timestamp": "2017-08-09T23:51:25.570Z",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36"
      },
      "mail": {
        "commonHeaders": {
          "from": [
            "sender@example.com"
          ],
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "subject": "Message sent from Amazon SES",
          "to": [
            "recipient@example.com"
          ]
        },
        "destination": [
          "recipient@example.com"
        ],
        "headers": [
          {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
          {
            "name": "X-SES-CONFIGURATION-SET",
            "value": "ConfigSet"
          },
          {
            "name": "From",
            "value": "sender@example.com"
          },
          {
            "name": "To",
            "value": "recipient@example.com"
          },
          {
            "name": "Subject",
            "value": "Message sent from Amazon SES"
          },
          {
            "name": "MIME-Version",
            "value": "1.0"
          },
          {
            "name": "Content-Type",
            "value": "multipart/alternative; boundary=\"XBoundary\""
          },
          {
            "name": "Message-ID",
            "value": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000"
          }
        ],
        "headersTruncated": false,
        "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
        "sendingAccountId": "123456789012",
        "source": "sender@example.com",
        "tags": {
          "ses:caller-identity": [
            "ses_user"
          ],
          "ses:configuration-set": [
            "ConfigSet"
          ],
          "ses:from-domain": [
            "example.com"
          ],
          "ses:source-ip": [
            "192.0.2.0"
          ]
        },
        "timestamp": "2017-08-09T23:50:05.795Z"
      }
    }' }
  end

  let(:reject_sns_event) do
    { 'Type' => 'Notification',
      'Message' => '{
        "eventType": "Reject",
        "mail": {
          "timestamp": "2016-10-14T17:38:15.211Z",
          "source": "sender@example.com",
          "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
          "sendingAccountId": "123456789012",
          "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "destination": [
            "sender@example.com"
          ],
          "headersTruncated": false,
          "headers": [
            {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
            {
              "name": "From",
              "value": "sender@example.com"
            },
            {
              "name": "To",
              "value": "recipient@example.com"
            },
            {
              "name": "Subject",
              "value": "Message sent from Amazon SES"
            },
            {
              "name": "MIME-Version",
              "value": "1.0"
            },
            {
              "name": "Content-Type",
              "value": "multipart/mixed; boundary=\"qMm9M+Fa2AknHoGS\""
            },
            {
              "name": "X-SES-MESSAGE-TAGS",
              "value": "myCustomTag1=myCustomTagValue1, myCustomTag2=myCustomTagValue2"
            }
          ],
          "commonHeaders": {
            "from": [
              "sender@example.com"
            ],
            "to": [
              "recipient@example.com"
            ],
            "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
            "subject": "Message sent from Amazon SES"
          },
          "tags": {
            "ses:configuration-set": [
              "ConfigSet"
            ],
            "ses:source-ip": [
              "192.0.2.0"
            ],
            "ses:from-domain": [
              "example.com"
            ],
            "ses:caller-identity": [
              "ses_user"
            ],
            "myCustomTag1": [
              "myCustomTagValue1"
            ],
            "myCustomTag2": [
              "myCustomTagValue2"
            ]
          }
        },
        "reject": {
          "reason": "Bad content"
        }
      }' }
  end

  let(:bounce_sns_event) do
    {
      'Type' => 'Notification',
      'Message' => '{
        "eventType":"Bounce",
        "bounce":{
          "bounceType":"Permanent",
          "bounceSubType":"General",
          "bouncedRecipients":[
            {
              "emailAddress":"recipient@example.com",
              "action":"failed",
              "status":"5.1.1",
              "diagnosticCode":"smtp; 550 5.1.1 user unknown"
            }
          ],
          "timestamp":"2017-08-05T00:41:02.669Z",
          "feedbackId":"01000157c44f053b-61b59c11-9236-11e6-8f96-7be8aexample-000000",
          "reportingMTA":"dsn; mta.example.com"
        },
        "mail":{
          "timestamp":"2017-08-05T00:40:02.012Z",
          "source":"Sender Name <sender@example.com>",
          "sourceArn":"arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
          "sendingAccountId":"123456789012",
          "messageId":"EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
          "destination":[
            "recipient@example.com"
          ],
          "headersTruncated":false,
          "headers":[
            {"name": "Message-ID", "value": "<5b35d2ed22cb2_16ad53ff7930c554c954a1@Michelsons-MacBook-Pro.local.mail>"},
            {
              "name":"From",
              "value":"Sender Name <sender@example.com>"
            },
            {
              "name":"To",
              "value":"recipient@example.com"
            },
            {
              "name":"Subject",
              "value":"Message sent from Amazon SES"
            },
            {
              "name":"MIME-Version",
              "value":"1.0"
            },
            {
              "name":"Content-Type",
              "value":"multipart/alternative; boundary=\"----=_Part_7307378_1629847660.1516840721503\""
            }
          ],
          "commonHeaders":{
            "from":[
              "Sender Name <sender@example.com>"
            ],
            "to":[
              "recipient@example.com"
            ],
            "messageId":"EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-dd0099a07f8a-000000",
            "subject":"Message sent from Amazon SES"
          },
          "tags":{
            "ses:configuration-set":[
              "ConfigSet"
            ],
            "ses:source-ip":[
              "192.0.2.0"
            ],
            "ses:from-domain":[
              "example.com"
            ],
            "ses:caller-identity":[
              "ses_user"
            ]
          }
        }
      }'
    }
  end

  #   describe "SNS notifications" do
  #
  #     it "will set a bounce" do
  #       inline_job do
  #         allow(Metric).to receive(:find_by).and_return(metric)
  #         campaign
  #         response = send_data(bounce_sns)
  #         expect(response.status).to be == 200
  #         expect(campaign.metrics.bounces.size).to be == 1
  #       end
  #     end
  #
  #     it "will set a spam metric and unsubscribe user" do
  #       inline_job do
  #         ActiveJob::Base.queue_adapter = :inline
  #         allow(Metric).to receive(:find_by).and_return(metric)
  #
  #         campaign
  #         response = send_data(complaint_sns)
  #         expect(response.status).to be == 200
  #         expect(campaign.metrics.spams.size).to be == 1
  #         expect(subscriber.reload).to be_unsubscribed
  #       end
  #     end
  #   end

  before do
    ActiveJob::Base.queue_adapter = :test
    ActiveJob::Base.queue_adapter.perform_enqueued_jobs = true
    ActiveJob::Base.queue_adapter.perform_enqueued_at_jobs = true
  end

  describe 'SNS events on campaign' do
    it 'will set a open' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(open_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.opens.size).to be == 1
      expect(campaign.metrics.opens.last.data).to be_present
    end

    it 'will set a deliver' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(delivery_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.deliveries.size).to be == 1
      expect(campaign.metrics.deliveries.last.data).to be_present
    end

    it 'will set a complaint' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(complaint_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.spams.size).to be == 1
      expect(campaign.metrics.spams.last.data).to be_present
    end

    it 'will set a reject' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(reject_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.rejects.size).to be == 1
      expect(campaign.metrics.rejects.last.data).to be_present
    end

    it 'will set a click' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(click_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.clicks.size).to be == 1
      expect(campaign.metrics.clicks.last.data).to be_present
    end

    it 'will set a bounce' do
      allow(Metric).to receive(:find_by).and_return(metric)
      campaign
      response = send_data(bounce_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.bounces.size).to be == 1
      expect(campaign.metrics.bounces.last.data).to be_present
    end
  end

  describe "SNS events on conversation" do
    
    it 'will set a open' do
      conversation
      expect(ConversationPart.last).to_not be_read
      response = send_data(open_sns_event_with_part)
      expect(response.status).to be == 200
      expect(ConversationPart.last).to be_read
    end

  end
end
