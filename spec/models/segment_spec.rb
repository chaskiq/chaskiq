require 'rails_helper'

RSpec.describe Segment, type: :model do
  #it{should belong_to :app}
  let!(:app){
    FactoryGirl.create :app
  }

  describe "creation" do
    
    let(:predicates) { [{
        type: "role", 
        attribute: "role", 
        comparison: "eq", 
        value: "user_role"
      }]
    }

    let(:predicates2) { [{
        type: "role", 
        attribute: "role", 
        comparison: "eq", 
        value: "user_role"
      },
      {
        type: "last_seen", 
        attribute: "role", 
        comparison: "eq", 
        value: "user_role"
      }]
    }

    it "add predicate" do
      app.segments.create(predicates: predicates)
      expect(app.segments.first.predicates.size).to be == 1
    end

    it "add 2 predicates" do
      app.segments.create(predicates: predicates2)
      expect(app.segments.first.predicates.size).to be == 2
    end


    describe "queries from predicates" do

      before :each do 
        app.add_visit({email: "foo@bar.cl", 
          properties: { custom_country: "albania"}
        })

        app.segments.create
      end

      let(:predicates){
        [{attribute: "last_visited_at", 
          comparison: "gteq", 
          type: "date", 
          value: "1 days ago"}.with_indifferent_access]
      }

      let(:predicates_for_empty){
        [{attribute: "last_visited_at", 
          comparison: "lteq", 
          type: "date", 
          value: "1 days ago"}.with_indifferent_access]
      }

      let(:online_predicate){
        { attribute: "state", 
          comparison: "eq", 
          type: "string", 
          value: "online"
        }.with_indifferent_access        
      }

      let(:email_predicate){
        [{attribute: "email", 
          comparison: "eq", 
          type: "string", 
          value: "foo@bar.cl"}.with_indifferent_access]
      }

      let(:predicates_with_or){
        predicates << online_predicate
        predicates << {
          attribute: "match",
          comparison: "match",
          value: "or",
          type: "match" 
        }.with_indifferent_access
      }

      let(:predicates_with_and){
        predicates << online_predicate
      }

      let(:predicates_on_jsonb){
        [{attribute: "custom_country", 
          comparison: "eq", 
          type: "string", 
          value: "albania"}.with_indifferent_access]
      }

      it "with date predicate gteq" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates)
        expect(app.segments.first.execute_query.count).to be == 1
      end 

      it "with date predicate lteq" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_for_empty)
        expect(app.segments.first.execute_query.count).to be == 0
      end 

      it "with multiple predicates concat or" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_or)
        expect(app.segments.first.execute_query.count).to be == 1
      end 

      it "with multiple predicates concat and" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_and)
        expect(app.segments.first.execute_query.count).to be == 0
      end 

      it "with jsonb" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_on_jsonb)
        expect(app.segments.first.execute_query.count).to be == 1
      end

      it "with user attribute" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(email_predicate)
        expect(app.segments.first.execute_query.count).to be == 1
      end

    end

  end
end
