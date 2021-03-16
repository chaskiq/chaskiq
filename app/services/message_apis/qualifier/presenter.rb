module MessageApis::Qualifier
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      options = ctx[:values][:item].map { |o| o[:name] }

      QualifierRecord.configure(
        options
      )

      record = QualifierRecord.new(items: [])

      ctx[:values][:item].map do |o|
        record.add_item(o[:name], o[:label])
      end

      {
        kind: kind,
        # ctx: ctx,
        definitions: record.schema
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      fields = ctx[:app].searcheable_fields.map do |o|
        o['name'].to_sym
      end

      QualifierRecord.configure(
        fields
      )

      params = ctx[:values].permit(fields)

      QualifierRecord.configure_validations(
        params.keys.map(&:to_sym)
      )

      record = QualifierRecord.new(
        params
      )

      record.valid?

      if record.valid? && ctx[:current_user].is_a?(AppUser)
        ctx[:current_user].update(
          params
        )
      end

      params.each_key do |o|
        record.add_item(o)
      end

      record.items.each do |o|
        o[:label] = ctx[:definitions]&.find { |d| d[:id] == o[:id] }&.dig(:label)
        o[:value] = ctx.dig(:values, o[:id].to_sym)
        o[:placeholder] = (o[:label]).to_s
      end

      definitions = record.schema

      result = {
        # kind: 'initialize',
        definitions: definitions
      }

      if record.valid?
        result.merge!(
          results: ctx[:values],
          definitions: record.confirmed_definitions
        )
      end

      result
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show
    # them configuration options before it’s inserted. Leaving this option
    # blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      app = ctx[:app]
      fields = app.searcheable_fields

      definitions = [
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
        },
        {
          type: 'text',
          text: 'Pick a template',
          style: 'header'
        },

        {
          type: 'list',
          disabled: false,
          items: [
            {
              type: 'item',
              id: 'contact-fields',
              title: 'Contact fields',
              subtitle: 'Ask for name , email & company',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'any-field',
              title: 'Custom Fields',
              subtitle: 'Ask for custom field data',
              action: {
                type: 'submit'
              }
            }
          ]
        }
      ]

      if ctx.dig(:field, :id) == 'contact-fields'

        r = QualifierRecordItem.new(
          options: fields
        )
        r.add_item('name')
        r.add_item('email')
        r.add_item('company_name')

        return {
          kind: kind,
          definitions: r.schema
        }
      end

      if ctx.dig(:field, :id) == 'any-field'
        r = QualifierRecordItem.new(
          options: fields
        )

        r.add_item(nil)

        return {
          kind: kind,
          definitions: r.schema
        }
      end

      if ctx.dig(:field, :id) == 'add-field'

        r = QualifierRecordItem.new(
          options: fields
        )

        ctx[:values].require(:item).each do |o|
          r.add_item(o[:name])
        end

        r.add_item(nil)

        return {
          kind: kind,
          definitions: r.schema
        }
      end

      if ctx.dig(:field, :id) == 'confirm' &&
         ctx.dig(:field, :action, :type) === 'submit'

        # TODO: validate

        return {
          kind: 'initialize',
          definitions: definitions,
          results: ctx[:values]
        }
      end

      {
        # kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      []
    end

    class QualifierRecordItem
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :options
      attr_writer :items

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
      attr_writer :items

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
        []
        #         [
        #           {
        #             type: 'text',
        #             text: "yes!!!!! your email is #{email}",
        #             style: 'header'
        #           },
        #           {
        #             type: 'text',
        #             text: "This is paragraph text. Here's a [link](https://dev.chaskiq.io/). Here's some *bold text*. Lorem ipsum.",
        #             style: 'paragraph'
        #           }
        #         ]
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
