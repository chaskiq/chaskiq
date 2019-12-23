# frozen_string_literal: true

class SegmentFactory
  def self.create_segments_for(app)
    default_predicate = { type: 'match',
                          attribute: 'match',
                          comparison: 'and',
                          value: 'and' }.with_indifferent_access

    user_predicate = {
      attribute: 'type',
      comparison: 'eq',
      type: 'string',
      value: 'AppUser'
    }.with_indifferent_access

    lead_predicate = { attribute: 'type',
                       comparison: 'eq',
                       type: 'string',
                       value: 'Lead' }.with_indifferent_access

    app.segments.create([
                          { name: 'all users', predicates: [default_predicate, user_predicate] },

                          { name: 'all leads', predicates: [default_predicate, lead_predicate] },

                          { name: 'active users', predicates: [default_predicate, user_predicate,
                                                               { attribute: 'last_visited_at',
                                                                 comparison: 'gt',
                                                                 type: 'date',
                                                                 value: '30 days ago' }.with_indifferent_access] },

                          { name: 'sleeping away', predicates: [default_predicate, user_predicate,
                                                                { attribute: 'last_visited_at',
                                                                  comparison: 'gteq',
                                                                  type: 'date',
                                                                  value: '1 days ago' }.with_indifferent_access] }
                        ])
  end
end
