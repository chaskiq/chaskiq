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

  let!(:role){
    app.add_agent({email: 'test@test.cl', first_name: 'dsdsa'})
  }

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
            "name": "X-CHASKIQ-CAMPAIGN-ID",
            "value": "'+campaign.id.to_s+'"
          },
          {
            "name": "X-CHASKIQ-CAMPAIGN-TO",
            "value": "'+subscriber.id.to_s+'"
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
    ->(email) {
      { 'Type' => 'Notification',
        'Message' => '{
        "eventType":"Complaint",
        "complaint": {
          "complainedRecipients":[
            {
              "emailAddress": "'+email+'"
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
              "name": "X-CHASKIQ-CAMPAIGN-ID",
              "value": "'+campaign.id.to_s+'"
            },
            {
              "name": "X-CHASKIQ-CAMPAIGN-TO",
              "value": "'+subscriber.id.to_s+'"
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
    }
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
            "name": "X-CHASKIQ-CAMPAIGN-ID",
            "value": "'+campaign.id.to_s+'"
          },
          {
            "name": "X-CHASKIQ-CAMPAIGN-TO",
            "value": "'+subscriber.id.to_s+'"
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
            "name": "X-CHASKIQ-CAMPAIGN-ID",
            "value": "'+campaign.id.to_s+'"
          },
          {
            "name": "X-CHASKIQ-CAMPAIGN-TO",
            "value": "'+subscriber.id.to_s+'"
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
            "name": "X-CHASKIQ-CAMPAIGN-ID",
            "value": "'+campaign.id.to_s+'"
          },
          {
            "name": "X-CHASKIQ-CAMPAIGN-TO",
            "value": "'+subscriber.id.to_s+'"
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
              "name": "X-CHASKIQ-CAMPAIGN-ID",
              "value": "'+campaign.id.to_s+'"
            },
            {
              "name": "X-CHASKIQ-CAMPAIGN-TO",
              "value": "'+subscriber.id.to_s+'"
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
    ->(email) {
      {
        'Type' => 'Notification',
        'Message' => '{
          "eventType":"Bounce",
          "bounce":{
            "bounceType":"Permanent",
            "bounceSubType":"General",
            "bouncedRecipients":[
              {
                "emailAddress":"'+email+'",
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
                "name": "X-CHASKIQ-CAMPAIGN-ID",
                "value": "'+campaign.id.to_s+'"
              },
              {
                "name": "X-CHASKIQ-CAMPAIGN-TO",
                "value": "'+subscriber.id.to_s+'"
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
    }
  end

  let(:raw_email_params) do
    {
      "notificationType":"Received",
      "mail":{
         "timestamp":"2020-08-14T19:49:44.895Z",
         "source":"miguelmichelson@gmail.com",
         "messageId":"4f2f8gu2t8fkov1aidn6vb92k10gsrp1doa8de01",
         "destination":[
            "messages+g2vt341@mail.chaskiq.io"
         ],
         "headersTruncated":false,
         "headers":[
            {
               "name":"Return-Path",
               "value":"<miguelmichelson@gmail.com>"
            },
            {
               "name":"Received",
               "value":"from mail-io1-f41.google.com (mail-io1-f41.google.com [209.85.166.41]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id 4f2f8gu2t8fkov1aidn6vb92k10gsrp1doa8de01 for messages+g2vt341@mail.chaskiq.io; Fri, 14 Aug 2020 19:49:44 +0000 (UTC)"
            },
            {
               "name":"X-SES-Spam-Verdict",
               "value":"PASS"
            },
            {
               "name":"X-SES-Virus-Verdict",
               "value":"PASS"
            },
            {
               "name":"Received-SPF",
               "value":"pass (spfCheck: domain of _spf.google.com designates 209.85.166.41 as permitted sender) client-ip=209.85.166.41; envelope-from=miguelmichelson@gmail.com; helo=mail-io1-f41.google.com;"
            },
            {
               "name":"Authentication-Results",
               "value":"amazonses.com; spf=pass (spfCheck: domain of _spf.google.com designates 209.85.166.41 as permitted sender) client-ip=209.85.166.41; envelope-from=miguelmichelson@gmail.com; helo=mail-io1-f41.google.com; dkim=pass header.i=@gmail.com; dmarc=pass header.from=gmail.com;"
            },
            {
               "name":"X-SES-RECEIPT",
               "value":"AEFBQUFBQUFBQUFGTzVoYUFaRGY5Q2NLZ3Nma0loTVp5QXVuUzlYL3hTUVptdUtDNUZWSDJTS1ZIVTFhaDA4T1h3YUs3a29CQ2dRWWRCS1RKd3Y1YStvQk5KOHE0WmM5dGFsc3hGOFdCTDlqL3EwR0RwU29ZblB4Slp5eVoxaTdKS3FnLzhLZzdMdDh2N0FGR3Y3RzB1T0xTa2daNTdoVkNGaFRsYTN4N0xUcWVCNFB0NWF5bWd0c0R6dW1KUkVycHZrTHZUWHp1MytTcUhnK2NlZEVobzUwQVduWG1jY1RPNmdxSlhNMUtVZlJpL1Q3OGhPdGRLWDRUYnZwL3B1VFc1YlA5TUFxa1ZzemZXUlloSVBWYWViS0VDRUFtcWVabkp0bjFRYTZjaWV1QmF5TDV4SlFhbUE9PQ=="
            },
            {
               "name":"X-SES-DKIM-SIGNATURE",
               "value":"a=rsa-sha256; q=dns/txt; b=IlBDYhfKqB+bu75lXGIcMPMdFNADTp+/jfMJseVyxpiL6Fo3N3svwxs28HTu8Yfo9nynxKUZf5vOgFzefeCNTBLO/DWpWK5zfFWU6/03pfdtexYczyIUk0KELudULezf/Q2sfvXsI87IIurVW9UlKpDJ3jnkUFfsUFlj+zN4Ly4=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1597434585; v=1; bh=EHhulQ4FeXWlglHhsEJHZvmTi6Mua7yQbb2zgjT/kA4=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;"
            },
            {
               "name":"Received",
               "value":"by mail-io1-f41.google.com with SMTP id v6so11827618iow.11 for <messages+g2vt341@mail.chaskiq.io>; Fri, 14 Aug 2020 12:49:44 -0700 (PDT)"
            },
            {
               "name":"DKIM-Signature",
               "value":"v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20161025; h=mime-version:references:in-reply-to:from:date:message-id:subject:to; bh=jOoWUuJuzaGMX5SOXHO/V+1PzwRke0eeBX/6vIyBKtc=; b=Y8KSY28G28U70b4uLeErPTIM95ZUI8LLACAOL48InRJM61JDJvvbC726exafajnwylnD0l437HyTK2/gkHr4GhQ9ebZMmaJ30/pgK7O+2pSvrJyN56gM+sCGOvt/hi0tVRI2P69IJ4MAEKfc8mq9Uc4bdsA2SYdKtm/tiS67x5hoYHMUUOD+WD8sXXeMz5OGOVSbPSIa+EBo91mDbdL7eBYAyOLeYOsxvMNhyERFUq0t4ymqYtLGIqApRTf0p+mol4HZRJSiyPZaJDtjsWx3dlD8F62NwG6/Jock+QgP6fsphks5V/THdZ3FNqHpAoUvO4sWgk2XbLGjlmqcFyiHoQ=="
            },
            {
               "name":"X-Google-DKIM-Signature",
               "value":"v=1; a=rsa-sha256; c=relaxed/relaxed; d=1e100.net; s=20161025; h=x-gm-message-state:mime-version:references:in-reply-to:from:date :message-id:subject:to; bh=jOoWUuJuzaGMX5SOXHO/V+1PzwRke0eeBX/6vIyBKtc=; b=ng6O4dz8WNFe99eFj14u/2KZzaJ8wuURTBLyxmHNJKF3EF389d+hwCS3AVGFbb2oxC W4cgnEgG3FQwvkOS7G+50OQFkXU5HXqDA8isxQPoELxZ/Ok6gRsl+DAR1PFl1pZXN+dA iREXNFiy7WiAwtqc9Bjz/pMOVZI7ctWE7xhd5TF6N0KT5WjGbjCgMCLeu/aIXY2uWpjX wPwhOFijrpV05dUdRJrnKkoJKKy36S+rqAM6q+Sv/yxbKE54FRcs6vcNCRmkF4ByFu1O T0YMwgOrpB7Zfjdks1S9nDLz5kcsKsXJ/R+MQpJURXqtDaF3hoqRU8a5D2vGOqslqlFg WPLA=="
            },
            {
               "name":"X-Gm-Message-State",
               "value":"AOAM533uOjdZZZgCz882nW0yeXg1B+WGLfw2lwEnGHvbiECGuMeSrqn8 zwA4Hm3UtuYZN1cNctyHEqyZLYAulGzL6MXuvgQ7+SXPC4A="
            },
            {
               "name":"X-Google-Smtp-Source",
               "value":"ABdhPJw7bvg6C7I4WLDG3Golv7t6DyEzfq5v6LaABUtPO/Tzjq5yS9hgdcRjRo+8JS7aXwBiqaDPRZ305VuzB6nDYCc="
            },
            {
               "name":"X-Received",
               "value":"by 2002:a6b:e40b:: with SMTP id u11mr3510676iog.123.1597434583900; Fri, 14 Aug 2020 12:49:43 -0700 (PDT)"
            },
            {
               "name":"MIME-Version",
               "value":"1.0"
            },
            {
               "name":"References",
               "value":"<01000173ee6a1381-35b23b52-c7a7-47f2-b019-fb7eed12e7e7-000000@email.amazonses.com> <01000173ee7a4bb6-1f0e6ce6-059a-45ed-99ac-ec1168a98d56-000000@email.amazonses.com> <CAC-9WweqznessGUn9CS47x4A1ZBw8Q31yQyoxfoVs3aG3pA+1A@mail.gmail.com>"
            },
            {
               "name":"In-Reply-To",
               "value":"<CAC-9WweqznessGUn9CS47x4A1ZBw8Q31yQyoxfoVs3aG3pA+1A@mail.gmail.com>"
            },
            {
               "name":"From",
               "value":"Miguel Michelsongs <miguelmichelson@gmail.com>"
            },
            {
               "name":"Date",
               "value":"Fri, 14 Aug 2020 15:49:32 -0400"
            },
            {
               "name":"Message-ID",
               "value":"<CAC-9WwdGMLqU1jv7xHOwxs3hNXaGt9EZLE2foJ5V4cAS2U+XrQ@mail.gmail.com>"
            },
            {
               "name":"Subject",
               "value":"Re: new message from Some App"
            },
            {
               "name":"To",
               "value":"Visitor Hj338 Some App <messages+g2vt341@mail.chaskiq.io>"
            },
            {
               "name":"Content-Type",
               "value":"multipart/alternative; boundary=\"000000000000ece54005acdbb888\""
            }
         ],
         "commonHeaders":{
            "returnPath":"miguelmichelson@gmail.com",
            "from":[
               "Miguel Michelsongs <miguelmichelson@gmail.com>"
            ],
            "date":"Fri, 14 Aug 2020 15:49:32 -0400",
            "to":[
               "Visitor Hj338 Some App <messages+g2vt341@mail.chaskiq.io>"
            ],
            "messageId":"<CAC-9WwdGMLqU1jv7xHOwxs3hNXaGt9EZLE2foJ5V4cAS2U+XrQ@mail.gmail.com>",
            "subject":"Re: new message from Some App"
         }
      },
      "receipt":{
         "timestamp":"2020-08-14T19:49:44.895Z",
         "processingTimeMillis":636,
         "recipients":[
            "messages+g2vt341@mail.chaskiq.io"
         ],
         "spamVerdict":{
            "status":"PASS"
         },
         "virusVerdict":{
            "status":"PASS"
         },
         "spfVerdict":{
            "status":"PASS"
         },
         "dkimVerdict":{
            "status":"PASS"
         },
         "dmarcVerdict":{
            "status":"PASS"
         },
         "action":{
            "type":"S3",
            "topicArn":"arn:aws:sns:us-east-1:255612241338:hermes-test",
            "bucketName":"chaskiq-test-bucket",
            "objectKeyPrefix":"mail",
            "objectKey":"mail/4f2f8gu2t8fkov1aidn6vb92k10gsrp1doa8de01"
         }
      }
   }
  end

  let(:message_notification_params) do
    {"Type"=>"Notification",
      "MessageId"=>"3fa66f25-a235-5a5b-aa51-3895542cf0b3",
      "TopicArn"=>"arn:aws:sns:us-east-1:255612241338:hermes-test",
      "Subject"=>"Amazon SES Email Receipt Notification",
      "Message"=>
       "{\"notificationType\":\"Received\",\"mail\":{\"timestamp\":\"2020-08-14T20:28:08.326Z\",\"source\":\"miguelmichelson@gmail.com\",\"messageId\":\"0vfh5uual2mmckaeivd120n0eiatleuo9k79p8g1\",\"destination\":[\"messages+g2vt341@mail.chaskiq.io\"],\"headersTruncated\":false,\"headers\":[{\"name\":\"Return-Path\",\"value\":\"<miguelmichelson@gmail.com>\"},{\"name\":\"Received\",\"value\":\"from mail-il1-f170.google.com (mail-il1-f170.google.com [209.85.166.170]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id 0vfh5uual2mmckaeivd120n0eiatleuo9k79p8g1 for messages+g2vt341@mail.chaskiq.io; Fri, 14 Aug 2020 20:28:08 +0000 (UTC)\"},{\"name\":\"X-SES-Spam-Verdict\",\"value\":\"PASS\"},{\"name\":\"X-SES-Virus-Verdict\",\"value\":\"PASS\"},{\"name\":\"Received-SPF\",\"value\":\"pass (spfCheck: domain of _spf.google.com designates 209.85.166.170 as permitted sender) client-ip=209.85.166.170; envelope-from=miguelmichelson@gmail.com; helo=mail-il1-f170.google.com;\"},{\"name\":\"Authentication-Results\",\"value\":\"amazonses.com; spf=pass (spfCheck: domain of _spf.google.com designates 209.85.166.170 as permitted sender) client-ip=209.85.166.170; envelope-from=miguelmichelson@gmail.com; helo=mail-il1-f170.google.com; dkim=pass header.i=@gmail.com; dmarc=pass header.from=gmail.com;\"},{\"name\":\"X-SES-RECEIPT\",\"value\":\"AEFBQUFBQUFBQUFFczRLSzdPVXN2WWJyUkNlYUlLUzg2SkxFMUtTLzFubHlTci8rKzEwdkZYSTJTblZld3pDTWVHT2hkWHpMaDVzanhTWWoydnNhelJWeFRoNi9laFFzRlpmdWdHaDJnaWNMaWhwMSt0cHowU29ncDdqSmxjamIvRmJuL0Q4cWgzSHZqYkxaSnZ5MUduUEdlUHY1ejdnbllGZks4MG5KN1k0THdNWEx0d2ZBRU9NVU8rVkNVVjhKS0hwZVlyUVFOMzg3UlEwS0pXSFdCU3ZxWFNuYjlNOGxXdHV1VGN2NjVwdGt1eVFqZEFXQ1NrYnpPUC9JY0ZXMDRHMkhwTnA5OGxVZnBlZFJBdTNaVGFKRVFBeXhOSlZXU1Q3bmpSbUdBRnp1U3JzZWYvdFpFVnc9PQ==\"},{\"name\":\"X-SES-DKIM-SIGNATURE\",\"value\":\"a=rsa-sha256; q=dns/txt; b=b/q4kU4o466AU+KIrZUeV7AUrw7tmB5a6+8P/qUehdRr1gtO7CQgIrrsm+FndSf64q9HmvrT8effU+ZAtbY9B2sEjq7cOubOS2E4NTkj8pi3hZA5+mDz796m/IRL7Em3juv+W/P/eAb1KmFgLJ6ow8h3zF0OHAqI1mDU4iB/Mos=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1597436888; v=1; bh=7BLaTTM3dNEAiO89qwgP9tBEvg+Uaod5Yih9afODn8Q=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;\"},{\"name\":\"Received\",\"value\":\"by mail-il1-f170.google.com with SMTP id e11so1544829ils.10 for <messages+g2vt341@mail.chaskiq.io>; Fri, 14 Aug 2020 13:28:08 -0700 (PDT)\"},{\"name\":\"DKIM-Signature\",\"value\":\"v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20161025; h=mime-version:references:in-reply-to:from:date:message-id:subject:to; bh=rov81Q/mrlMLHVPySd5t1/TMB0w3hN1r3tZxD1hwg98=; b=SiZwHPf8oozsFaGn0dEbhZvdIGXBdYXJxkecokQjmOVtyoPvc3TFivv5je0IgcTvVuUWjkt43KSzk1NsIDcSa3T7cdz8JPYDb0/B2zOpCWV+DahBlW9cUUeTOdq1Nzyv2zLkK0zug1V1dHx/gGGQNaLioDBRRz1FvKieRusUiNxBmyhRj7zGF1jk/HZUC9hJjU0ZjHBlbEIdbg3OutcmXRdlUCNodjW1hgxA/SQCSl3dawWnyeM3fezuK38q4vRiCNE6yWPYX1N4KDMFw0Eis02Irp3ba05GDW++CJtEmRjb0ex9kByUNy8IzltaRCLLKpZHBJQAXEqzt4lRZ8VrPg==\"},{\"name\":\"X-Google-DKIM-Signature\",\"value\":\"v=1; a=rsa-sha256; c=relaxed/relaxed; d=1e100.net; s=20161025; h=x-gm-message-state:mime-version:references:in-reply-to:from:date :message-id:subject:to; bh=rov81Q/mrlMLHVPySd5t1/TMB0w3hN1r3tZxD1hwg98=; b=fgCKQcawpL5fWJss4+m0Tx/VsrEseLf/P9cZ07b5lt1tou2t5JHELwUe5wnXyTpOkZ 2UimppK6MrRaF0BzgNRCFWVHTFZ/E8b7exRxyFCExozcauhi2T1eqWetHeveMDeMje6t bfHGD5DDeWXKcv3mf7uURimP8wTTG6eABjPuL3evOGSViLs6GeyrQhxj5ffX9gyBC3IO nfm14hHCvEMPG/LVCTJGIyFxmWG1Uc9oFhrkoCuLfvADZhitbAbm0aSSVBlvh60jsKz/ TL5VQU50tu6pu8kU2n/AREA/qWj5tWXc6Le1A2Ci4Iq46mQsn1jZSmOiUSYdi8j58s00 0nEQ==\"},{\"name\":\"X-Gm-Message-State\",\"value\":\"AOAM533CSe8SGNLfDwyOjn+RBjIzsTB8IQbuRwroYEvhE20wBSVP1mfi TfxX9+uVOl6PhRyronkS17BNqGtyL4udZTr4tN5Rjcdu06FdzA==\"},{\"name\":\"X-Google-Smtp-Source\",\"value\":\"ABdhPJzAN+NutzTWJcxsZDfxNPahiMiieUUfnVxZ9Fw2ZZsApPwBKPHRlgRYfNIA+Yz/wFGjDG85OZanMWibC8yG6mc=\"},{\"name\":\"X-Received\",\"value\":\"by 2002:a92:84cb:: with SMTP id y72mr4006932ilk.106.1597436887228; Fri, 14 Aug 2020 13:28:07 -0700 (PDT)\"},{\"name\":\"MIME-Version\",\"value\":\"1.0\"},{\"name\":\"References\",\"value\":\"<01000173ee6a1381-35b23b52-c7a7-47f2-b019-fb7eed12e7e7-000000@email.amazonses.com> <01000173ee7a4bb6-1f0e6ce6-059a-45ed-99ac-ec1168a98d56-000000@email.amazonses.com> <CAC-9WweqznessGUn9CS47x4A1ZBw8Q31yQyoxfoVs3aG3pA+1A@mail.gmail.com> <CAC-9WwdGMLqU1jv7xHOwxs3hNXaGt9EZLE2foJ5V4cAS2U+XrQ@mail.gmail.com> <CAC-9Wwd1y7JZmzMhRAugVgZpxo1Q6cM7bS5JAeJP0bTiz5DK8g@mail.gmail.com>\"},{\"name\":\"In-Reply-To\",\"value\":\"<CAC-9Wwd1y7JZmzMhRAugVgZpxo1Q6cM7bS5JAeJP0bTiz5DK8g@mail.gmail.com>\"},{\"name\":\"From\",\"value\":\"Miguel Michelsongs <miguelmichelson@gmail.com>\"},{\"name\":\"Date\",\"value\":\"Fri, 14 Aug 2020 16:27:55 -0400\"},{\"name\":\"Message-ID\",\"value\":\"<CAC-9WwedQsr-KDGBnempby7TV4SsL3P0TyX79fj9wTp0DYF-Sw@mail.gmail.com>\"},{\"name\":\"Subject\",\"value\":\"Re: new message from Some App\"},{\"name\":\"To\",\"value\":\"Visitor Hj338 Some App <messages+g2vt341@mail.chaskiq.io>\"},{\"name\":\"Content-Type\",\"value\":\"multipart/alternative; boundary=\\\"00000000000036e63705acdc420e\\\"\"}],\"commonHeaders\":{\"returnPath\":\"miguelmichelson@gmail.com\",\"from\":[\"Miguel Michelsongs <miguelmichelson@gmail.com>\"],\"date\":\"Fri, 14 Aug 2020 16:27:55 -0400\",\"to\":[\"Visitor Hj338 Some App <messages+g2vt341@mail.chaskiq.io>\"],\"messageId\":\"<CAC-9WwedQsr-KDGBnempby7TV4SsL3P0TyX79fj9wTp0DYF-Sw@mail.gmail.com>\",\"subject\":\"Re: new message from Some App\"}},\"receipt\":{\"timestamp\":\"2020-08-14T20:28:08.326Z\",\"processingTimeMillis\":934,\"recipients\":[\"messages+g2vt341@mail.chaskiq.io\"],\"spamVerdict\":{\"status\":\"PASS\"},\"virusVerdict\":{\"status\":\"PASS\"},\"spfVerdict\":{\"status\":\"PASS\"},\"dkimVerdict\":{\"status\":\"PASS\"},\"dmarcVerdict\":{\"status\":\"PASS\"},\"action\":{\"type\":\"S3\",\"topicArn\":\"arn:aws:sns:us-east-1:255612241338:hermes-test\",\"bucketName\":\"chaskiq-test-bucket\",\"objectKeyPrefix\":\"mail\",\"objectKey\":\"mail/0vfh5uual2mmckaeivd120n0eiatleuo9k79p8g1\"}}}",
      "Timestamp"=>"2020-08-14T20:28:09.268Z",
      "SignatureVersion"=>"1",
      "Signature"=>
       "D/kFCV/ISJHXS4n2C13rGjLHlzQAKxOesaVncjW0rKstmms3alV80Gd3qUYc5YnioXAYJvYC3w+OzdMuzqrLCaQGrQqbwA2Ru1L/rNgVkLw6bAV4WadKK1fFuYP9XPe/1AzWBACVdeDvS0qm6pCF5dRbRR7AQfHM2x7XHSdjBzWIKb/qUfnXxcbFeNjOdeDECdF6l/+gokFb+/+41rlv4UYoHrTDq3Fo2qJ4ABbaVQa3WVApg0563pJxkupUk+ys203D4UGWOFbZrM6GIWJQFgzoq3PMFXxG8w9/sl8NO/64eWG8N5C/dV4k0RAml8y2H318WQWpoVpJ/oN1tcGKAg==",
      "SigningCertURL"=>"https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem",
      "UnsubscribeURL"=>
       "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:255612241338:hermes-test:fa969063-a5f1-4a29-993c-ce78589374db"}
  end

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
      allow_any_instance_of(SnsReceiverJob).to receive(:get_email_from_notification).and_return([subscriber.email])
      campaign
      response = send_data(complaint_sns_event[subscriber.email])
      expect(response.status).to be == 200
      expect(campaign.metrics.spams.size).to be == 1
      expect(campaign.metrics.spams.last.data).to be_present
      expect(subscriber.reload).to be_unsubscribed
    end

    it 'will set a reject' do
      allow(Metric).to receive(:find_by).and_return(metric)
      allow_any_instance_of(SnsReceiverJob).to receive(:get_email_from_notification).and_return([subscriber.email])
      campaign
      response = send_data(reject_sns_event)
      expect(response.status).to be == 200
      expect(campaign.metrics.rejects.size).to be == 1
      expect(campaign.metrics.rejects.last.data).to be_present
      expect(subscriber.reload).to_not be_unsubscribed
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
      allow_any_instance_of(SnsReceiverJob).to receive(:get_email_from_notification).and_return([subscriber.email])
      campaign
      response = send_data(bounce_sns_event[subscriber.email])
      expect(response.status).to be == 200
      expect(campaign.metrics.bounces.size).to be == 1
      expect(campaign.metrics.bounces.last.data).to be_present
      expect(subscriber.reload).to be_unsubscribed
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

    it 'will set a open' do
      conversation
      expect(ConversationPart.last).to_not be_read
      response = send_data(open_sns_event_with_part)
      expect(response.status).to be == 200
      expect(ConversationPart.last).to be_read
    end

    it "complaint" do
      conversation
      expect(ConversationPart.last).to_not be_read
      response = send_data(complaint_sns_event[conversation.main_participant.email])
      expect(response.status).to be == 200
      expect(ConversationPart.last).to_not be_read
      expect(conversation.main_participant.reload).to be_unsubscribed
    end


    context 'conversation email receipt' do

      before :each do
        allow_any_instance_of(Api::V1::HooksController).to receive(
          :is_notification_message?
        ).and_return(true)
  
        allow_any_instance_of(Api::V1::HooksController).to receive(
          :find_resources_in_recipient_parts
        ).and_return(
          [conversation.app, conversation]
        )
  
        allow_any_instance_of(Api::V1::HooksController).to receive(
          :find_remitent
        ).and_return(
          conversation.app.agents.first
        )
      end

      it 'message' do

        allow_any_instance_of(Api::V1::HooksController).to receive(
          :read_mail_file
        ).and_return( 
          File.open( Rails.root.to_s + '/spec/fixtures/emails/aws_sample.eml' ).read
        )

        expect(ConversationPart.last).to_not be_read
    
        response = send_data(message_notification_params)
  
        #expect(response.status).to be == 200
        expect(ConversationPart.last.messageable.serialized_content).to be_present
      end

      it 'message inline attachment' do

        allow_any_instance_of(Api::V1::HooksController).to receive(
          :read_mail_file
        ).and_return( 
          File.open( Rails.root.to_s + '/spec/fixtures/emails/aws_sample_multi_inline_attachment.eml' ).read
        )
        
        expect(ConversationPart.last).to_not be_read
    
        response = send_data(message_notification_params)
  
        #expect(response.status).to be == 200
        expect(ConversationPart.last.messageable.serialized_content).to be_present
      end

      it 'message file as attachment' do
        allow_any_instance_of(Api::V1::HooksController).to receive(
          :read_mail_file
        ).and_return( 
          File.open( Rails.root.to_s + '/spec/fixtures/emails/aws_sample_as_attachment.eml' ).read
        )
        
        expect(ConversationPart.last).to_not be_read
    
        response = send_data(message_notification_params)

        #puts ConversationPart.last.messageable.html_content
        expect(ConversationPart.last.messageable.serialized_content).to be_present
      end

    end
  end


  describe "SNS events on conversation on inbound address" do
    
    it 'message' do
      allow_any_instance_of(Api::V1::HooksController).to receive(
        :read_mail_file
      ).and_return( 
        File.open( Rails.root.to_s + '/spec/fixtures/emails/aws_sample.eml' ).read
      )

      allow_any_instance_of(Mail::Message).to receive(
        :recipients
      ).and_return([role.inbound_email_address])

      allow_any_instance_of(Mail::Message).to receive(
        :message_id
      ).and_return("message_id-1234")

      response = send_data(message_notification_params)
      expect(ConversationPart.last.email_message_id).to be == "message_id-1234"
      expect(ConversationPart.last.messageable.serialized_content).to be_present
    end
  end
end
