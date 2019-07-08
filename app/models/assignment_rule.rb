class AssignmentRule < ApplicationRecord
  belongs_to :app
  belongs_to :agent
  store_accessor :conditions

  def check_rule_for(conversation_part)

    match_condition = self.conditions.find{|o| o["type"] == "match" }
    query_conditions = self.conditions.reject{|o| o["type"] == "match" }

    # we will accept empty conditions as a true, ok ?
    return true if query_conditions.blank?

    matches = query_conditions.map do |r|
      case r["type"]
        when "string" then check_string_comparison(r,conversation_part)
        when "date" then check_date_comparison(r, conversation_part)
      end
    end
    
    if match_condition.blank? or match_condition["comparison"] == "or"
      matches.include?(true)
    elsif match_condition["comparison"] == "and"
      !matches.include?(false)
    end
  end

  def check_string_comparison(rule, part)
    # check where to search on the value 
    #  app user or message ?
    cond = case rule["comparison"]
      when "eq" then rule["value"] == part
      when "not_eq" then rule["value"] != part
      when "contains_start" then rule["value"] == part
      when "contains_ends" then rule["value"].start_with?(part)
      when "contains" then rule["value"].include?(part)
      when "not_contains" then !rule["value"].include?(part)
      when "is_null" then rule["value"].empty?
      when "is_not_null" then !rule["value"].empty?
    end
  end

  def check_date_comparison(rule, part)
    case rule["comparison"]
      when "lt"
      when "eq"
      when "gt"
    end
  end

end
