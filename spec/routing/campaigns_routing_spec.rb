require "rails_helper"

RSpec.describe CampaignsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(:get => "/campaigns").to route_to("campaigns#index")
    end

    it "routes to #new" do
      expect(:get => "/campaigns/new").to route_to("campaigns#new")
    end

    it "routes to #show" do
      expect(:get => "/campaigns/1").to route_to("campaigns#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/campaigns/1/edit").to route_to("campaigns#edit", :id => "1")
    end


    it "routes to #create" do
      expect(:post => "/campaigns").to route_to("campaigns#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/campaigns/1").to route_to("campaigns#update", :id => "1")
    end

    it "routes to #update via PATCH" do
      expect(:patch => "/campaigns/1").to route_to("campaigns#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/campaigns/1").to route_to("campaigns#destroy", :id => "1")
    end
  end
end
