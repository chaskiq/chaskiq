# frozen_string_literal: true

class HexValidator < ActiveModel::EachValidator
  def validate_each(object, attribute, value)
    object.errors[attribute] << (options[:message] || 'must be a valid CSS hex color code') unless value =~ /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i
  end
end
