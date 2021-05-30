require "mail"

module EmailValidable
  extend ActiveSupport::Concern

  class EmailValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      record.errors[attribute] << (options[:message] || "is not an email") unless Truemail.valid?(value, with: :regex)
    end
  end
end
