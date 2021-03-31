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

        
        expect(comparator.compare).to be_truthy
      end

      it 'with date predicate lteq' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_for_empty)
        expect(app.segments.first.execute_query.count).to be == 0

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_for_empty
        )

        
        expect(comparator.compare).to be_falsey
      end

      it 'with multiple predicates concat or' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_or)
        expect(app.segments.first.execute_query.count).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_with_or
        )

        
        expect(comparator.compare).to be_truthy
      end

      it 'with multiple predicates concat and' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_with_and)
        expect(app.segments.first.execute_query.count).to be == 0

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_with_and
        )

        
        expect(comparator.compare).to be_falsey
      end

      it 'with jsonb' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_on_jsonb)
        expect(app.segments.first.execute_query.count).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_jsonb
        )

        
        expect(comparator.compare).to be_truthy
      end

      it 'with user attribute' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(email_predicate)

        expect(app.segments.first.execute_query.count).to be == 1
        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: email_predicate
        )

        
        expect(comparator.compare).to be_truthy
      end

      it 'with user attribute' do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(not_email_predicate)
        expect(app.segments.first.execute_query.count).to be == 0
        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: not_email_predicate
        )

        
        expect(comparator.compare).to be_falsey
      end

      let(:predicates_on_tags) do
        [{ attribute: 'tags',
           comparison: 'eq',
           type: 'string',
           value: 'foo' }.with_indifferent_access]
      end

      let(:predicates_on_tags_contains_multiple) do
        [
          {
            type: 'match',
            value: 'or'
          }.with_indifferent_access,
          { attribute: 'tags',
            comparison: 'contains_ends',
            type: 'string',
            value: 'oo' }.with_indifferent_access,
          { attribute: 'tags',
            comparison: 'contains_ends',
            type: 'string',
            value: 'aa' }.with_indifferent_access
        ]
      end

      let(:predicates_on_tags_contains) do
        predicates << { attribute: 'tags',
                        comparison: 'contains_ends',
                        type: 'string',
                        value: 'oo' }.with_indifferent_access
      end

      let (:predicates_on_user_type) do
        [
          {"type"=>"match", "value"=>"and", "attribute"=>"match", "comparison"=>"and"}, 
          {"type"=>"string", "value"=>["AppUser", "Lead", "Visitor"], "attribute"=>"type", "comparison"=>"in"}
        ]
      end

      it "app type in" do
        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_on_user_type)
        expect(app.segments.first.execute_query.count).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_user_type
        )

        expect(comparator.compare).to be_truthy
      end

      it 'with user tag' do
        app.app_users.each { |o| o.tag_list << 'foo'; o.save }

        allow_any_instance_of(Segment).to receive(:predicates).and_return(predicates_on_tags)
        expect(app.segments.first.execute_query.size).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_tags
        )

        expect(comparator.compare).to be_truthy
      end

      it 'with user tag contains ends' do
        app.app_users.each { |o| o.tag_list << 'foo'; o.save }

        allow_any_instance_of(Segment).to receive(:predicates).and_return(
          predicates_on_tags_contains
        )

        expect(app.segments.first.execute_query.size).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_tags_contains
        )

        expect(comparator.compare).to be_truthy
      end

      it 'with user tag multiple' do
        app.app_users.each { |o| o.tag_list << 'foo'; o.save }

        allow_any_instance_of(Segment).to receive(:predicates).and_return(
          predicates_on_tags_contains_multiple
        )

        expect(app.segments.first.execute_query.size).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_tags_contains_multiple
        )

        
        expect(comparator.compare).to be_truthy
      end

      let(:predicates_on_tags_contains_multiple_2) do
        [
          {
            type: 'match',
            value: 'or'
          }.with_indifferent_access,
          { attribute: 'name',
            comparison: 'contains_ends',
            type: 'string',
            value: 'arilyn' }.with_indifferent_access,
          { attribute: 'tags',
            comparison: 'contains_ends',
            type: 'string',
            value: 'foo' }.with_indifferent_access
        ]
      end

      it 'OR with user tag multiple and by name ' do
        app.app_users.each { |o| o.tag_list << 'foo'; o.save }

        app.app_users.first.update(name: 'marilyn')

        allow_any_instance_of(Segment).to receive(:predicates).and_return(
          predicates_on_tags_contains_multiple_2
        )

        expect(app.segments.first.execute_query.size).to be == 1

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates_on_tags_contains_multiple_2
        )

        
        expect(comparator.compare).to be_truthy
      end

      it 'AND with user tag multiple with exclude' do
        predicates = predicates_on_tags
        predicates << {
          attribute: 'tags',
          comparison: 'not_contains',
          type: 'string',
          value: 'marilyn'
        }.with_indifferent_access

        app.app_users.each { |o| o.tag_list.add('foo') }

        app.app_users.first.tag_list.add('marilyn')

        allow_any_instance_of(Segment).to receive(:predicates).and_return(
          predicates
        )

        expect(app.segments.first.execute_query.size).to be == 0

        comparator = SegmentComparator.new(
          user: app.app_users.last,
          predicates: predicates
        )

        
        expect(comparator.compare).to be_falsey
      end
    end
  end
end
