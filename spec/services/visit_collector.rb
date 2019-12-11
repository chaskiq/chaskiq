require 'rails_helper'

RSpec.describe VisitCollector do

  let(:app){ FactoryBot.create :app}

  let(:app_user){ 
    app.add_user({email: "test@test.cl", first_name: "dsdsa"})
  }

  let(:browser_options){
    { "title"=>"Chaskiq CLIENT TEST",
      "url"=>"http://foo.bar/1",
      "browser_version"=>"78.0.3904.108",
      "browser_name"=>"Chrome",
      "os_version"=>"10.13.6",
      "os"=>"Mac OS"
    }
  }

  subject { VisitCollector.new(user: app_user) }

  it "visit collector will add visit" do
    subject.user = app_user
    subject.update_browser_data(browser_options)
    expect(app_user.os).to be == browser_options["os"]
    expect(app_user.os_version).to be == browser_options["os_version"]
    expect(app_user.browser_version).to be == browser_options["browser_version"]
    expect(app_user.visits.count).to be == 1
    expect(app_user.web_sessions).to be == 1
  end

  it "visit twice collector will add only one visit" do
    subject.user = app_user
    subject.update_browser_data(browser_options)
    subject.update_browser_data(browser_options)
    expect(app_user.web_sessions).to be == 1
  end

  it "visit last seen 30 days collector will add second 2 visit" do
    subject.user = app_user
    subject.update_browser_data(browser_options)
    app_user.update(last_visited_at: 30.day.ago)
    subject.update_browser_data(browser_options)
    expect(app_user.web_sessions).to be == 2
  end

  it "visit last seen 30 min ago collector will add second 2 visit" do
    subject.user = app_user
    subject.update_browser_data(browser_options)
    app_user.update(last_visited_at: 30.minutes.ago)
    subject.update_browser_data(browser_options)
    expect(app_user.web_sessions).to be == 2
  end

  it "visit twice before 20 min will add 2 visit" do
    subject.user = app_user
    subject.update_browser_data(browser_options)
    app_user.update(last_visited_at: 23.minutes.ago)
    subject.update_browser_data(browser_options)
    expect(app_user.web_sessions).to be == 1
  end

end