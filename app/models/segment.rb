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

    add_errors_on_predicates
  end

  def add_errors_on_predicates
    predicates.each do |prop|
      attrs = %i[attribute comparison type value].map(&:to_s)
      next unless (prop.keys - attrs).any?

      handle_predicate_error(prop)
    end
  end

  def handle_predicate_error(prop)
    errors.add(:properties, 'predicates are invalid') if prop['type'] != 'or'
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
    predicates.reject { |o| o['attribute'] == 'tags' }
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    tags = Arel::Table.new :tags # Base Rel-var
    query = nil
    tags_query = nil
    Array(predicates_for_arel).each_with_index do |predicate, _index|
      next if predicate['type'] == 'match'

      # check if its in table column
      field = build_predicate_field(predicate)
      
      check = check_predicate(predicate, field)

      query = build_query(check, query)
    end
    tagged_result(query)
  end

  def build_query(check, query)
    if query.nil?
      check
    elsif predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }
      query.or(check)
    else
      query.and(check)
    end
  end

  def check_predicate(predicate, field)
    # date predicates
    case predicate['type']
    when 'date'
      check = cast_date(field).send(predicate['comparison'], Chronic.parse(predicate['value']))
    when 'string'
      check = check_string(predicate, field)
    when 'integer'
      check = check_integer(predicate, field)
    end
  end

  def check_integer(predicate, field)
    case predicate['comparison']
    when 'is_null'
      cast_int(field).eq(nil)
    when 'is_not_null'
      cast_int(field).not_eq(nil)
    else
      if %w[eq lt lteq gt gteq].include?(predicate['comparison'])
        cast_int(field).send(
          predicate['comparison'],
          predicate['value']
        )
      end
    end
    check
  end

  def check_string(predicate, field)
    case predicate['comparison']
    when 'contains_start'
      query_string = "#{predicate['value']}%"
      field.matches(query_string)
    when 'contains_ends'
      query_string = "%#{predicate['value']}"
      field.matches(query_string)
    when 'is_null'
      field.eq(nil)
    when 'is_not_null'
      field.not_eq(nil)
    when 'contains'
      query_string = "%#{predicate['value']}%"
      field.matches(query_string)
    when 'not_contains'
      query_string = "%#{predicate['value']}%"
      field.does_not_match(query_string)
    else
      field.send(predicate['comparison'], predicate['value'])
    end
  end

  def build_predicate_field(predicate)
    arel_table = AppUser.arel_table
    cols = AppUser.columns
    if cols.map(&:name).include?(predicate['attribute'])
      arel_table[predicate['attribute']]
    else
      # otherwise use in JSONB properties column
      Arel::Nodes::InfixOperation.new('->>',
                                      arel_table[:properties],
                                      Arel::Nodes.build_quoted((predicate['attribute']).to_s))
    end
  end

  def tagged_result(query)
    result = app.app_users

    tags = Arel::Table.new :tags # Base Rel-var
    field = tags[:name]

    or_predicate = predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }

    any_tags = or_predicate.present?

    tags_query = nil
    base_taggings = Arel::Table.new(:taggings)

    to_exclude = []

    tags_predicates = predicates.select { |o| o['attribute'] == 'tags' }

    tags_predicates.each_with_index do |predicate, index|
      inverse = false

      taggings = Arel::Table.new(:taggings).alias("tags_index_#{index}") # Base Rel-var

      case predicate['comparison']
      when 'contains_start'
        query_string = "#{predicate['value']}%"
        check = field.matches(query_string)
      when 'contains_ends'
        query_string = "%#{predicate['value']}"
        check = field.matches(query_string)
      when 'is_null'
        check = tags[:id].not_eq(nil)
        inverse = true
      when 'is_not_null'
        check = tags[:id].not_eq(nil)
      when 'contains'
        query_string = "%#{predicate['value']}%"
        check = field.matches(query_string)
      when 'not_contains'
        query_string = "%#{predicate['value']}%"
        # will inverse on query
        check = field.matches(query_string)
        inverse = true
      when 'not_eq'
        query_string = (predicate['value']).to_s
        # will inverse on query
        check = field.eq(query_string)
        inverse = true
      else
        check = field.send(predicate['comparison'], predicate['value'])
      end

      # check = field.eq(nil)
      init = tags_query.nil? || inverse ? result.arel_table : tags_query

      if or_predicate
        tags_query = if tags_query.blank?
                       check
                     else
                       tags_query.or(check)
                     end
      else
        q = taggings[:tag_id].in(tags.project(tags[:id]).where(check))
        # q = taggings[:tag_id].not_in( tags.project(tags[:id]).where(check)) if inverse
        j = init.join(taggings).on(
          taggings[:taggable_id].eq(result.arel_table[:id]).and(
            taggings[:taggable_type].eq('AppUser')
          ).and(q)
        )
        to_exclude << j if inverse
        tags_query = j unless inverse
      end
    end

    if or_predicate && tags_query
      a = base_taggings[:taggable_id].eq(
        result.arel_table[:id]
      ).and(
        base_taggings[:taggable_type].eq('AppUser')
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

    if to_exclude
      exx = []
      to_exclude.each do |ex|
        exx << result.select('app_users.id').arel.except(result.joins(ex.join_sources).select('app_users.id').arel)
      end

      exx.each do |e|
        result = result.where(result.arel_table[:id].in(e))
      end
    end

    if tags_query
      return result.joins(tags_query.join_sources).where(query).distinct if query

      return result.joins(tags_query.join_sources).distinct
    end

    return result.where(query) if query

    result
  end
end
