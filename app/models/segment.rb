# frozen_string_literal: true

require 'chronic'

class Segment < ApplicationRecord
  include UnionScope

  belongs_to :app, optional: true
  store :properties, accessors: %i[
    per_page
    predicates
    sort_by
    sort_direction
  ], coder: JSON

  validate :check_array

  def check_array
    return if predicates.blank?

    predicates.each do |prop|
      o = prop.keys - %i[attribute comparison type value].map(&:to_s)
      next unless o.any?

      unless prop['type'] == 'or'
        errors.add(:properties, 'predicates are invalid')
      end
    end
  end

  # predicate example:
  # {type: "role", attribute: "role", comparison: "eq", value: "user_role"}

  def query
    app
    app_users = AppUser.arel_table
    app.app_users.arel_table[Arel.star]
  end

  def execute_query
    arel_table = AppUser.arel_table
    user_table = AppUser.arel_table

    # left_outer_join = arel_table
    #                .join(user_table, Arel::Nodes::OuterJoin)
    #                .on(user_table[:id].eq(arel_table[:user_id]))
    #                .join_sources

    # self.app.app_users.joins(left_outer_join).where(query_builder)
    app.app_users.where(query_builder)
  end

  def cast_int(field)
    Arel::Nodes::NamedFunction.new('cast', [field.as('int')])
  end

  def cast_date(field)
    Arel::Nodes::NamedFunction.new('cast', [field.as('date')])
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    arel_table = AppUser.arel_table

    cols = AppUser.columns
    # user_table = User.arel_table
    Array(predicates).reduce(nil) do |query, predicate|
      next if predicate['type'] == 'match'

      # check if its in table column
      if cols.map(&:name).include?(predicate['attribute'])
        field = arel_table[predicate['attribute']]
      else
        # otherwise use in JSONB properties column
        # else
        field = Arel::Nodes::InfixOperation.new('->>',
                                                arel_table[:properties],
                                                Arel::Nodes.build_quoted((predicate['attribute']).to_s))
        # end
      end

      # date predicates
      case predicate['type']
      when 'date'
        check = cast_date(field).send(predicate['comparison'], Chronic.parse(predicate['value']))
      when 'string'
        case predicate['comparison']
        when 'contains_start'
          query_string = "#{predicate['value']}%"
          check = field.matches(query_string)
        when 'contains_ends'
          query_string = "%#{predicate['value']}"
          check = field.matches(query_string)
        when 'is_null'
          check = field.eq(nil)
        when 'is_not_null'
          check = field.not_eq(nil)
        when 'contains'
          query_string = "%#{predicate['value']}%"
          check = field.matches(query_string)
        when 'not_contains'
          query_string = "%#{predicate['value']}%"
          check = field.does_not_match(query_string)
        else
          check = field.send(predicate['comparison'], predicate['value'])
        end
        check
      when 'integer'
        case predicate['comparison']
        when 'is_null'
          check = cast_int(field).eq(nil)
        when 'is_not_null'
          check = cast_int(field).not_eq(nil)
        else
          if %w[eq lt lteq gt gteq].include?(predicate['comparison'])
            check = cast_int(field).send(
              predicate['comparison'],
              predicate['value']
            )
          end
        end
        check
      end

      if query.nil?
        check
      else

        if predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }
          query.or(check)
        else
          query.and(check)
        end
      end
    end
  end
end



