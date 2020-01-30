# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Segment, type: :model do
  # it{should belong_to :app}
  let!(:app) do
    FactoryBot.create :app
  end

  describe 'creation' do
    let(:predicates) do
      [{
        type: 'role',
        attribute: 'role',
        comparison: 'eq',
        value: 'user_role'
      }]
    end

    let(:predicates2) do
      [{
        type: 'role',
        attribute: 'role',
        comparison: 'eq',
        value: 'user_role'
      },
       {
         type: 'last_seen',
         attribute: 'role',
         comparison: 'eq',
         value: 'user_role'
       }]
    end

    it 'add predicate' do
      segment = app.segments.create(predicates: predicates)
      expect(segment.predicates.size).to be == 1
    end

    it 'add 2 predicates' do
      segment = app.segments.create(predicates: predicates2)
      expect(segment.predicates.size).to be == 2
    end

    describe 'queries from predicates' do
      before :each do
        app.add_visit(email: 'foo@bar.cl',
                      properties: { custom_country: 'albania' })

        app.segments.create
      end

      let(:predicates) do
        [{ attribute: 'last_visited_at',
           comparison: 'gteq',
           type: 'date',
           value: '1 days ago' }.with_indifferent_access]
      end

      let(:predicates_for_empty)  do
        [{ attribute: 'last_visited_at',
           comparison: 'lteq',
           type: 'date',
           value: '1 days ago' }.with_indifferent_access]
      end

      let(:online_predicate) do
        { attribute: 'state',
          comparison: 'eq',
          type: 'string',
          value: 'online' }.with_indifferent_access
      end

      let(:email_predicate) do
        [{ attribute: 'email',
           comparison: 'eq',
           type: 'string',
           value: 'foo@bar.cl' }.with_indifferent_access]
      end

      let(:not_email_predicate) do
        [{ attribute: 'email',
           comparison: 'not_eq',
           type: 'string',
           value: 'foo@bar.cl' }.with_indifferent_access]
      end

      let(:predicates_with_or)  do
        predicates << online_predicate
        predicates << {
          attribute: 'match',
          comparison: 'match',
          value: 'or',
          type: 'match'
        }.with_indifferent_access
      end

      let(:predicates_with_and) do
        predicates << online_predicate
      end

      let(:predicates_on_jsonb) do
        [{ attribute: 'custom_country',
           comparison: 'eq',
           type: 'string',
           value: 'albania' }.with_indifferent_access]
      end

      it 'with date predicate gteq' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates)
        expect(app.segments.first.execute_query.count).to be == 1


        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: predicates 
        )

        comparator.compare
        expect(comparator.compare).to be_truthy
      end

      it 'with date predicate lteq' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_for_empty)
        expect(app.segments.first.execute_query.count).to be == 0

        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: predicates_for_empty 
        )

        comparator.compare
        expect(comparator.compare).to be_falsey
      end
      

      it 'with multiple predicates concat or' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_or)
        expect(app.segments.first.execute_query.count).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: predicates_with_or 
        )

        comparator.compare
        expect(comparator.compare).to be_truthy
      end

      it 'with multiple predicates concat and' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_and)
        expect(app.segments.first.execute_query.count).to be == 0

        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: predicates_with_and 
        )

        comparator.compare
        expect(comparator.compare).to be_falsey
      end

      it 'with jsonb' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_on_jsonb)
        expect(app.segments.first.execute_query.count).to be == 1
        
        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: predicates_on_jsonb 
        )

        comparator.compare
        expect(comparator.compare).to be_truthy
      end

      it 'with user attribute' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(email_predicate)
        expect(app.segments.first.execute_query.count).to be == 1
        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: email_predicate 
        )

        comparator.compare
        expect(comparator.compare).to be_truthy
      end

      it 'with user attribute' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(not_email_predicate)
        expect(app.segments.first.execute_query.count).to be == 0
        comparator = SegmentComparator.new(
          user: app.app_users.last, 
          predicates: not_email_predicate 
        )

        comparator.compare
        expect(comparator.compare).to be_falsey
      end


    end


  end
end
