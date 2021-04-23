class SegmentComparator
  attr_accessor :user, :predicates

  def initialize(user:, predicates:)
    self.user = user
    self.predicates = predicates
  end

  def compare
    condition_predicates = predicates.select { |o| o['type'] != 'match' }

    query = handle_condition_predicates(condition_predicates)

    return true if query.size.zero?

    if predicates.find { |o| o['type'] == 'match' && o['value'] == 'or' }
      query.include?(true)
    else
      query.include?(true) && !query.include?(false)
    end
  end

  def handle_condition_predicates(condition_predicates)
    cols = AppUser.columns
    query = []
    condition_predicates.collect do |predicate|
      # predicate = predicate.with_indifferent_access
      # next if predicate['type'] == 'match'
      field = field_handler(cols, predicate)

      if field.is_a?(Array)
        field.each do |f|
          query << handle_comparison(f, predicate)
        end
      end

      query << handle_comparison(field, predicate)
    end
    query
  end

  def field_handler(cols, predicate)
    if cols.map(&:name).include?(predicate['attribute'])
      user.send(predicate['attribute'].to_sym)
    elsif predicate['attribute'] == 'tags'
      user.tag_list
    else
      user.properties[predicate['attribute'].to_s]
    end
  end

  def compare_with(user_input, predicate_value, comparison)
    result = case comparison
             when 'contains_start' then user_input.start_with?(predicate_value)
             when 'contains_ends' then user_input.end_with?(predicate_value)
             when 'is_null' then user_input.blank?
             when 'is_not_null' then !user_input.blank?
             when 'contains' then user_input.include?(predicate_value)
             when 'not_contains' then !user_input.include?(predicate_value)
             when 'not_eq' then user_input != predicate_value
             when 'eq' then user_input == predicate_value
             when 'lt' then user_input < predicate_value
             when 'lteq' then user_input <= predicate_value
             when 'gt' then user_input > predicate_value
             when 'in' then user_input.in?(predicate_value)
             when 'gteq' then user_input >= predicate_value
             end
  end

  def handle_comparison(field, predicate)
    case predicate['type']
    when 'date'
      val = Chronic.parse(predicate['value'])
      field = Chronic.parse(field) if field.is_a?(String)
      check = compare_with(field, val, predicate['comparison'])
    # check = cast_date(field).send(predicate['comparison'], Chronic.parse(predicate['value']))
    when 'string'
      check = compare_with(field.to_s, predicate['value'], predicate['comparison'])
    when 'integer'
      check = compare_with(field.to_i, predicate['value'].to_i, predicate['comparison'])
    end
    check
  end
end
