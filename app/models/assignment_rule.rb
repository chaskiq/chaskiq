# frozen_string_literal: true

class AssignmentRule < ApplicationRecord
  belongs_to :app
  belongs_to :agent
  store_accessor :conditions

  default_scope { order('priority asc') }

  def check_rule_for(text, part)
    match_condition = conditions.find { |o| o['type'] == 'match' }
    query_conditions = conditions.reject { |o| o['type'] == 'match' }

    # we will accept empty conditions as a true, ok ?
    return true if query_conditions.blank?

    subject = nil
    matches = handle_rule_matches(part, text, query_conditions)

    if match_condition.blank? || (match_condition['comparison'] == 'or')
      matches.include?(true)
    elsif match_condition['comparison'] == 'and'
      !matches.include?(false)
    end
  end

  def handle_rule_matches(part, text, query_conditions)
    query_conditions.map do |rule|
      subject = subject_value(rule, part, text)
      return false if subject.blank?

      case rule['type']
      when 'string' then check_string_comparison(rule, subject)
      when 'date' then check_date_comparison(rule, subject)
      end
    end
  end

  def check_string_comparison(rule, part)
    # check where to search on the value
    # app user or message ?
    cond = case rule['comparison']
           when 'eq' then rule['value'] == part
           when 'not_eq' then rule['value'] != part
           when 'contains_start' then rule['value'].start_with?(part)
           when 'contains_ends' then rule['value'].end_with?(part)
           when 'contains' then rule['value'].include?(part)
           when 'not_contains' then !rule['value'].include?(part)
           when 'is_null' then rule['value'].empty?
           when 'is_not_null' then !rule['value'].empty?
           end
  end

  def check_date_comparison(rule, _part)
    case rule['comparison']
    when 'lt'
    when 'eq'
    when 'gt'
    end
  end

  def subject_value(rule, part, text)
    if rule['attribute'] === 'message_content'
      text
    else
      subject_value_for(rule['attribute'], part.authorable)
    end
  end

  def subject_value_for(attr, app_user)
    fields = app_user.app.searcheable_fields_list
    app_user.send(attr) if fields.include?(attr)
  end
end
