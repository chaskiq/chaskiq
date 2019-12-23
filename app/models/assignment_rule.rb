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

    matches = query_conditions.map do |r|
      subject = if r['attribute'] === 'message_content'
                  text
                else
                  subject_value_for(r['attribute'], part.authorable)
                end

      return false if subject.blank?

      case r['type']
      when 'string' then check_string_comparison(r, subject)
      when 'date' then check_date_comparison(r, subject)
      end
    end

    if match_condition.blank? || (match_condition['comparison'] == 'or')
      matches.include?(true)
    elsif match_condition['comparison'] == 'and'
      !matches.include?(false)
    end
  end

  def check_string_comparison(rule, part)
    # check where to search on the value
    #  app user or message ?
    cond = case rule['comparison']
           when 'eq' then rule['value'] == part
           when 'not_eq' then rule['value'] != part
           when 'contains_start' then rule['value'] == part
           when 'contains_ends' then rule['value'].start_with?(part)
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

  def subject_value_for(attr, app_user)
    app_user.send(attr) if AppUser::ENABLED_SEARCH_FIELDS.include?(attr)
  end
end
