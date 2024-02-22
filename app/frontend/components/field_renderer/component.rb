# frozen_string_literal: true

class FieldRenderer::Component < ApplicationViewComponent
  option :form
  option :definitions

  def foo(definition)
    case definition[:type]
    when "string"
      form.text_field definition[:name], label: definition[:label]
    when "number"
      form.number_field definition[:name], label: definition[:label]
    when "textarea", "text"
      form.text_area definition[:name], label: definition[:label]
    when "checkbox"
      form.check_box definition[:name], label: definition[:label]
    when "radio"
      form.radio_button definition[:name], label: definition[:label]
    when "timezone", "select"
      form.select definition[:name],
                  definition[:options],
                  multiple: definition[:multiple],
                  label: definition[:label]
    when "datetime"
      form.datetime_field definition[:name], label: definition[:label]
    else
      raise "not type found for #{definition[:type]}"

    end
  end
end
