require "rails_helper"

RSpec.describe CampaignMailer, type: :mailer do

  #let(:template){ FactoryBot.create(:chaskiq_template) }
  let(:app){ FactoryBot.create(:app) }
  let!(:subscriber){
    app.add_user(email: Faker::Internet.email, properties: { 
          custom_country: "albania",
          name: Faker::Name.unique.name,
          country: "Athens", 
          company: "Acme"
        })
  }
  let!(:campaign){ FactoryBot.create(:campaign, app: app) }
  let(:template_html){ "<p>{{name}}</p>"}
  let(:premailer_template){"<p>
    {{name}} {{last_name}} 
    {{email}} 
    {{campaign_url}}
    {{campaign_subscribe}} 
    {{campaign_unsubscribe}}
    {{campaign_description}} 
    {{track_image_url}}

    this is the template

    <a href='http://google.com'>don't be evil</a>
    <a href='{{campaign_url}}'>campaign url</a>
    <a href='{{campaign_unsubscribe}}'>campaign url</a>

    {{company}}
    {{country}}
    </p>"}

  before do
    allow_any_instance_of(Campaign).to receive(:premailer).and_return(premailer_template)
    allow_any_instance_of(Campaign).to receive(:html_content).and_return(template_html)
    #allow_any_instance_of(AppUser).to receive(:properties).and_return({country: "Athens", company: "Acme"})
    
    CampaignMailer.newsletter(campaign, app.app_users.first).deliver_now
  end

  it "pass subscriber attributes to template" do
    at = campaign.attributes_for_template(subscriber)
    expect(last_email.subject).to_not be_blank

    expect(last_email.body).to include(subscriber.name)
    expect(last_email.body).to include(subscriber.last_name)
    expect(last_email.body).to include(subscriber.email)

    expect(last_email.body).to include(at[:campaign_url])
    expect(last_email.body).to include(at[:campaign_unsubscribe])
    expect(last_email.body).to include(at[:campaign_subscribe])
    expect(last_email.body).to include(at[:campaign_description])
    expect(last_email.body).to include(at[:track_image_url])
  end

  it "should deliver with open.gif" do
    expect(last_email.body).to include("open.gif")
  end

end
