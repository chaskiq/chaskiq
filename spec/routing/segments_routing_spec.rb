require "rails_helper"

RSpec.describe SegmentsController, type: :routing do
  describe "routing" do

    before(:each )do
      skip
    end
    
    it "routes to #index" do
      expect(:get => "/segments").to route_to("segments#index")
    end

    it "routes to #new" do
      expect(:get => "/segments/new").to route_to("segments#new")
    end

    it "routes to #show" do
      expect(:get => "/segments/1").to route_to("segments#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/segments/1/edit").to route_to("segments#edit", :id => "1")
    end


    it "routes to #create" do
      expect(:post => "/segments").to route_to("segments#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/segments/1").to route_to("segments#update", :id => "1")
    end

    it "routes to #update via PATCH" do
      expect(:patch => "/segments/1").to route_to("segments#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/segments/1").to route_to("segments#destroy", :id => "1")
    end
  end
end
