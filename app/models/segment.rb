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

  def tagged_result(result)

    tt = predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }

    any_tags = tt.present?

    predicates.select { |o| o['attribute'] == 'tags' }.each_with_index do |predicate, index|

      result = case predicate['comparison']
        when 'contains_start'
          query_string = "#{predicate['value']}%"
          result.tagged_with(predicate['value'], wild: true, any: any_tags)
        when 'contains_ends'
          result.tagged_with(predicate['value'], wild: true, any: any_tags)
        when 'is_null'
          result.tagged_with(predicate['value'], exclude: true, any: any_tags) 
        when 'is_not_null'
        when 'contains'
          result.tagged_with(predicate['value'], wild: true, any: any_tags)
        when 'eq'
          result.tagged_with(predicate['value'], any: any_tags)
        when 'not_eq'
          result.tagged_with(predicate['value'], exclude: true, any: any_tags)
        when 'not_contains'
          result.tagged_with(predicate['value'], wild: true, exclude: true, any: any_tags)
        else
          #check = taggings[:tag_id].not_in( tags.project(tags[:id]).where( field.matches(query_string) )) ) 
          check = result.tagged_with(predicate["value"])
      end

    end

    #return result.joins(tags_query.join_sources).distinct() if tags_query
    result
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    arel_table = AppUser.arel_table
    tags = Arel::Table.new :tags # Base Rel-var
    # taggings_join = taggings[:taggable_id].eq(arel_table[:id]).and(taggings[:taggable_type].eq("AppUser"))

    cols = AppUser.columns
    # user_table = User.arel_table
    query = nil
    tags_query = nil
    Array(predicates_for_arel).each_with_index do |predicate, index|
      next if predicate['type'] == 'match'

      # check if its in table column
      field = if cols.map(&:name).include?(predicate['attribute'])
                arel_table[predicate['attribute']]
              elsif predicate['attribute'] == "tags"
                tags[:name]
              else
                # otherwise use in JSONB properties column
                # else
                Arel::Nodes::InfixOperation.new('->>',
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

    result = self.app.app_users
    if query
      result = result.where(query)
    end
    
    tagged_result(result)
  end
end