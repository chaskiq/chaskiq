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

      errors.add(:properties, 'predicates are invalid') unless prop['type'] == 'or'
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

    # result = app.app_users.find_by_sql(query_builder)
    # app.app_users.where(query_builder)

    query_builder
  end

  def cast_int(field)
    Arel::Nodes::NamedFunction.new('cast', [field.as('int')])
  end

  def cast_date(field)
    Arel::Nodes::NamedFunction.new('cast', [field.as('date')])
  end

  def predicates_for_arel
    predicates.reject{|o| o["attribute"] == "tags" }
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    arel_table = AppUser.arel_table
    tags = Arel::Table.new :tags # Base Rel-var
    cols = AppUser.columns
    query = nil
    tags_query = nil
    Array(predicates_for_arel).each_with_index do |predicate, index|
      next if predicate['type'] == 'match'
      # check if its in table column
      field = if cols.map(&:name).include?(predicate['attribute'])
                arel_table[predicate['attribute']]
              #elsif predicate['attribute'] == "tags"
              #  tags[:name]
              else
                # otherwise use in JSONB properties column
                Arel::Nodes::InfixOperation.new('->>',
                                                arel_table[:properties],
                                                Arel::Nodes.build_quoted((predicate['attribute']).to_s))
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
        query = check
      else

        if predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }
          query = query.or(check)
        else
          query = query.and(check)
        end

      end
    end

    #result = self.app.app_users
    #if query
    #  result = result.where(query)
    #end

    tagged_result(query)
  end

  def tagged_result(query)

    result = self.app.app_users

    tags = Arel::Table.new :tags # Base Rel-var
    field = tags[:name]

    or_predicate = predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }

    any_tags = or_predicate.present?

    tags_query = nil
    base_taggings = Arel::Table.new( :taggings)

    tags_predicates = predicates.select { |o| o['attribute'] == 'tags' }

    tags_predicates.each_with_index do |predicate, index|

      taggings = Arel::Table.new( :taggings).alias("tags_index_#{index}") # Base Rel-var

      # check = field.eq(nil)
      init = tags_query.nil? ? result.arel_table : tags_query

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
  
      if !or_predicate
        tags_query = init.join(taggings).on( 
          taggings[:taggable_id].eq(result.arel_table[:id]
        ).and(
          taggings[:taggable_type].eq('AppUser')
        ).and(
          taggings[:tag_id].in( tags.project(tags[:id]).where(check)) )  
        )
      else
        if tags_query.blank? 
          tags_query = check
        else
          tags_query = tags_query.or(check)
        end
      end
    end

    if or_predicate && tags_query
      a = base_taggings[:taggable_id].eq(
        result.arel_table[:id]
      ).and(
        base_taggings[:taggable_type].eq("AppUser") 
      ).and(
        base_taggings[:tag_id].in( 
          tags.project(tags[:id]).where(tags_query)
        )
      ) 
      g = ActsAsTaggableOn::Tagging.arel_table
      b = g.project(Arel.star).where(a).exists
      return result.where(b).where(query) if query
      return result.where(b)
    end

    if(tags_query)
      return result.joins(tags_query.join_sources).where(query) if query
      return result.joins(tags_query.join_sources)
    end

    if(query)
      return result.where(query)
    end

    result

  end
end