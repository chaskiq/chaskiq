# frozen_string_literal: true

module MessageApis
  class Qualifier < BasePackage
    attr_accessor :secret

    # for display in replied message
    def self.display_data(data); end

    class QualifierRecordItem
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :options, :items

      def initialize(options:)
        @options = options
      end

      def items
        @items ||= []
      end

      def add_item(name)
        items << { name: name, label: '' }
      end

      def item(name:, label:, index:)
        [
          {
            type: 'input',
            id: "item[#{index}][label]",
            placeholder: 'enter your data',
            label: 'Label',
            value: label
          },
          {
            type: 'dropdown',
            id: "item[#{index}][name]",
            label: 'Value',
            value: name,
            options: options.each_with_index.map do |o, _i|
              {
                type: 'option',
                text: o['name'],
                name: o['name'],
                id: o['name']
              }
            end
          }
        ]
      end

      def schema
        fields = header_fields

        fields << @items.each_with_index.map do |o, i|
          item(name: o[:name], label: o[:label], index: i)
        end

        fields << confirm_buttons

        fields.flatten
      end

      def header_fields
        [
          {
            type: 'text',
            style: 'header',
            align: 'center',
            text: 'qualify users'
          },
          {
            type: 'text',
            style: 'muted',
            align: 'center',
            text: 'Compose forms for qualificators'
          },
          {
            type: 'separator'
          }
        ]
      end

      def confirm_buttons
        [
          {
            type: 'button',
            id: 'add-field',
            label: 'Add new field',
            align: 'left',
            variant: 'outlined',
            action: {
              type: 'submit'
            }
          },
          {
            type: 'button',
            id: 'confirm',
            label: 'Confirm Fields',
            align: 'center',
            action: {
              type: 'submit'
            }
          }
        ]
      end
    end


    class QualifierRecord
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :items

      def self.configure(opts)
        opts.each do |o|
          attr_accessor o
        end
      end

      def self.configure_validations(opts)
        opts.each do |o|
          validates o, presence: true
          validates_format_of :email, with: URI::MailTo::EMAIL_REGEXP if o == :email
        end
      end

      def items
        @items ||= []
      end

      def add_item(name, label = nil)
        @items = items << {
          type: 'input',
          id: name,
          placeholder: "type your #{label}",
          label: label,
          value: send(name.to_sym),
          errors: errors[name.to_sym]&.uniq&.join(', '),
          action: {
            type: 'submit'
          }
        }
      end

      def valid_schema
        return []
        [
          {
            type: 'text',
            text: "yes!!!!! your email is #{email}",
            style: 'header'
          },
          {
            type: 'text',
            text: "This is paragraph text. Here's a [link](https://dev.chaskiq.io/). Here's some *bold text*. Lorem ipsum.",
            style: 'paragraph'
          }
        ]
      end

      def schema
        @items
      end

      def confirmed_definitions
        @items.map  do |o|
          o[:disabled] = true
          o
        end
      end
    end
  end
end
