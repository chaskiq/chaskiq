

class HexValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors[attribute] << (options[:message] || "must be a valid hex color") unless hex_valid?(value)    
  end

  def hex_valid?(hex)
    !hex[/\H/]
  end 
end