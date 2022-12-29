# frozen_string_literal: true

require "chronic"

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
    errors.add(:properties, "predicates are invalid") if prop["type"] != "or"
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
    query_builder
  end

  def cast_int(field)
    Arel::Nodes::NamedFunction.new("cast", [field.as("int")])
  end

  def cast_date(field)
    Arel::Nodes::NamedFunction.new("cast", [field.as("date")])
  end

  def predicates_for_arel
    predicates.reject { |o| o["attribute"] == "tags" }
  end

  # JSONB queries on steroids
  # https://jes.al/2016/01/querying-json-fields-in-postgresql-using-activerecord/

  def query_builder
    tags = Arel::Table.new :tags # Base Rel-var
    query = nil
    tags_query = nil
    Array(predicates_for_arel).each_with_index do |predicate, _index|
      next if predicate["type"] == "match"

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
    elsif predicates.find { |o| o["type"] == "match" && o["value"] == "or" }
      query.or(check)
    else
      query.and(check)
    end
  end

  def check_predicate(predicate, field)
    # date predicates
    case predicate["type"]
    when "date"
      check = cast_date(field).send(predicate["comparison"], Chronic.parse(predicate["value"]))
    when "string"
      check = check_string(predicate, field)
    when "integer"
      check = check_integer(predicate, field)
    end
  end

  def check_integer(predicate, field)
    case predicate["comparison"]
    when "is_null"
      cast_int(field).eq(nil)
    when "is_not_null"
      cast_int(field).not_eq(nil)
    else
      if %w[eq lt lteq gt gteq].include?(predicate["comparison"])
        cast_int(field).send(
          predicate["comparison"],
          predicate["value"]
        )
      end
    end
  end

  def check_string(predicate, field)
    case predicate["comparison"]
    when "contains_start"
      query_string = "#{predicate['value']}%"
      field.matches(query_string)
    when "contains_ends"
      query_string = "%#{predicate['value']}"
      field.matches(query_string)
    when "is_null"
      field.eq(nil)
    when "is_not_null"
      field.not_eq(nil)
    when "contains"
      query_string = "%#{predicate['value']}%"
      field.matches(query_string)
    when "not_contains"
      query_string = "%#{predicate['value']}%"
      field.does_not_match(query_string)
    else
      field.send(predicate["comparison"], predicate["value"])
    end
  end

  def build_predicate_field(predicate)
    arel_table = AppUser.arel_table
    cols = AppUser.columns
    if cols.map(&:name).include?(predicate["attribute"])
      arel_table[predicate["attribute"]]
    else
      # otherwise use in JSONB properties column
      Arel::Nodes::InfixOperation.new("->>",
                                      arel_table[:properties],
                                      Arel::Nodes.build_quoted((predicate["attribute"]).to_s))
    end
  end

  def tagged_result(query)
    result = app.app_users

    tags = Arel::Table.new :tags # Base Rel-var
    field = tags[:name]

    or_predicate = predicates.find { |o| o["type"] == "match" && o["value"] == "or" }

    any_tags = or_predicate.present?

    tags_query = nil
    base_taggings = Arel::Table.new(:taggings)

    to_exclude = []

    tags_predicates = predicates.select { |o| o["attribute"] == "tags" }

    tags_predicates.each_with_index do |predicate, index|
      inverse = false

      taggings = Arel::Table.new(:taggings).alias("tags_index_#{index}") # Base Rel-var

      case predicate["comparison"]
      when "contains_start"
        query_string = "#{predicate['value']}%"
        check = field.matches(query_string)
      when "contains_ends"
        query_string = "%#{predicate['value']}"
        check = field.matches(query_string)
      when "is_null"
        check = tags[:id].not_eq(nil)
        inverse = true
      when "is_not_null"
        check = tags[:id].not_eq(nil)
      when "contains"
        query_string = "%#{predicate['value']}%"
        check = field.matches(query_string)
      when "not_contains"
        query_string = "%#{predicate['value']}%"
        # will inverse on query
        check = field.matches(query_string)
        inverse = true
      when "not_eq"
        query_string = (predicate["value"]).to_s
        # will inverse on query
        check = field.eq(query_string)
        inverse = true
      else
        check = field.send(predicate["comparison"], predicate["value"])
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
            taggings[:taggable_type].eq("AppUser")
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

    if to_exclude
      exx = []
      to_exclude.each do |ex|
        exx << result.select("app_users.id").arel.except(result.joins(ex.join_sources).select("app_users.id").arel)
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

  ### ELASTIC SEARCH IMPLEMENTATION ###

  def term_fragment(clause, attribute, value)
    {
      clause: clause,
      fragment: {
        term: { attribute => { value: value } }
      }
    }
  end

  def terms_fragment(clause, attribute, value)
    {
      clause: clause,
      fragment: {
        terms: { attribute => value }
      }
    }
  end

  def match_fragment(clause, attribute, value, analyzer = "searchkick_search")
    {
      clause: clause,
      fragment: {
        match: {
          attribute => {
            query: value,
            boost: 10,
            operator: "and",
            analyzer: analyzer
          }
        }
      }
    }
  end

  def filter_regex_fragment(clause, attribute, value)
    {
      clause: clause,
      fragment: {
        regexp: {
          attribute => {
            value: value,
            flags: "NONE",
            case_insensitive: true
          }
        }
      }
    }
  end

  def exists_fragment(clause, attribute, value)
    {
      clause: clause,
      fragment: {
        bool: {
          must_not: {
            exists: {
              field: attribute
            }
          }
        }
      }
    }
  end

  def clause_group(predicates, clause)
    predicates&.filter { |o| o[:clause] == clause }&.map { |o| o[:fragment] }&.flatten || []
  end

  def nested_preds_group(clause, attributes)
    return attributes if attributes.blank?

    q = attributes.map do |o|
      [{
        term: {
          "custom_attributes.name": { value: o["attribute"] }
        }
      },
       {
         term: {
           "custom_attributes.value": { value: o["value"] }
         }
       }]
    end.flatten

    q_predicates = attributes.map do |pred|
      case pred["comparison"]
      when "in"
      # terms_fragment(:must, pred["attribute"], pred["value"])
      when "eq"
        term_fragment(:must, "custom_attributes.value", pred["value"])
      when "not_eq"
        term_fragment(:must_not, "custom_attributes.value", pred["value"])
      when "contains"
        filter_regex_fragment(:filter, "custom_attributes.value", ".*#{pred['value']}.*")
      # match_fragment(:must, "custom_attributes.value", pred["value"])
      when "not_contains"
        filter_regex_fragment(:must_not, "custom_attributes.value", ".*#{pred['value']}.*")
      # match_fragment(:must_not, "custom_attributes.value", pred["value"])
      when "is_null"
        exists_fragment(:must, "custom_attributes.value", pred["value"])
      when "is_not_null"
        exists_fragment(:must_not, "custom_attributes.value", pred["value"])
      when "contains_ends"
        filter_regex_fragment(:filter, "custom_attributes.value", ".*#{pred['value']}")
      when "contains_start"
        filter_regex_fragment(:filter, "custom_attributes.value", "#{pred['value']}.*")
      end
    end&.flatten&.compact || []

    fields = attributes.map  do |o|
      {
        term: { "custom_attributes.name" => o["attribute"] }
      }
    end

    {
      nested: {
        path: "custom_attributes",
        query: {
          bool: {
            must_not: clause_group(q_predicates, :must_not),
            should: clause_group(q_predicates, :should),
            filter: clause_group(q_predicates, :filter),
            must: fields + clause_group(q_predicates, :must)
          }
        }
      }
    }
  end

  def es_search(page = nil, per = nil)
    search_attrs = %w[
      id
      type
      name
      first_name
      last_name
      email
      lang
      tags
      phone
      last_visited_at
      referrer
      state
      ip
      city
      region
      country
      lat
      lng
      postal
      web_sessions
      timezone
      browser
      browser_version
      os
      os_version
      browser_language
    ]
    custom_fields = app.custom_fields || []

    preds = predicates.filter { |o| o["type"] != "match" and search_attrs.include?(o["attribute"]) }
    nested_preds = predicates.filter do |o|
      custom_fields.map { |cf| cf["name"] }.include?(o["attribute"])
    end

    q_predicates = preds.map do |pred|
      case pred["comparison"]
      when "in"
        terms_fragment(:filter, pred["attribute"], pred["value"])
      when "eq"
        term_fragment(:must, (pred["attribute"]).to_s, pred["value"])
      # match_fragment(:must, "#{pred["attribute"]}.analyzed", pred["value"])
      when "not_eq"
        term_fragment(:must_not, (pred["attribute"]).to_s, pred["value"])
      when "contains"
        match_fragment(:must, "#{pred['attribute']}.word_start", pred["value"])
      # filter_fragment(:filter, "#{pred["attribute"]}", "#{pred["value"]}*")
      when "not_contains"
        match_fragment(:must_not, "#{pred['attribute']}.word_start", pred["value"])
      when "is_null"
        exists_fragment(:must, pred["attribute"], pred["value"])
      when "is_not_null"
        exists_fragment(:must_not, pred["attribute"], pred["value"])
      when "contains_ends"
        filter_regex_fragment(:filter, (pred["attribute"]).to_s, ".*#{pred['value']}")
      when "contains_start"
        match_fragment(:filter, "#{pred['attribute']}.word_start", pred["value"])
        # filter_regex_fragment(:filter, "#{pred["attribute"]}", ".#{pred["value"]}*")
      end
    end&.flatten&.compact || []

    q_predicates << {
      clause: :filter,
      fragment: {
        term: { app_id: { value: app_id } }
      }
    }

    query = {
      query: {
        bool: {
          must: (clause_group(q_predicates, :must) << nested_preds_group(:c, nested_preds)).compact.flatten,
          must_not: clause_group(q_predicates, :must_not),
          should: clause_group(q_predicates, :should),
          filter: clause_group(q_predicates, :filter)
        }
      }
    }

    Rails.logger.info(query)

    AppUser.search(body: query, page: page, per_page: per)

    # AppUser.search("*", where: { type: ["AppUser", "Lead"] })

    # AppUser.search("*", where: { name: { ilike: "%migue%" } })
  end
end
