module MessageApis::Qualifier
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      options = ctx[:values][:item].pluck(:name)

      QualifierRecord.configure(
        options
      )

      record = QualifierRecord.new(items: [])
      record.searcheable_fields = ctx[:package].app.searcheable_fields

      ctx[:values][:item].map do |o|
        optional = o[:optional].present? ? "--optional" : ""
        record.add_item("#{o[:name]}#{optional}", o[:label])
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
      app = ctx[:package].app

      optional_identifier = "--optional"

      fields = ctx[:package].app.searcheable_fields.map do |o|
        o["name"]
      end

      optional_fields = ctx[:package].app.searcheable_fields.map do |o|
        "#{o['name']}#{optional_identifier}"
      end

      all_fields = fields + optional_fields
      params = ctx[:values].permit(all_fields)

      QualifierRecord.configure(
        fields
      )

      optional_keys = params.to_h.keys.select do |key|
        key.include?(optional_identifier)
      end

      original_params = params
      params = params.transform_keys do |key|
        key.gsub(optional_identifier, "")
      end

      record = QualifierRecord.new(
        params
      )

      keys_to_bypass = optional_keys.map do |o|
        o.gsub(optional_identifier, "")
      end.compact

      keys_to_validate = params.to_h.keys

      record.validatable_fields = keys_to_validate
      record.optional_fields = keys_to_bypass
      record.searcheable_fields = app.searcheable_fields

      if record.valid? && ctx[:current_user].is_a?(AppUser)
        app = ctx[:current_user].app

        app.update_properties(ctx[:current_user], params)
      end

      original_params.each_key do |o|
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
      app = ctx[:package].app
      fields = app.searcheable_fields

      definitions = [
        {
          type: "text",
          style: "header",
          align: "center",
          text: "qualify users"
        },
        {
          type: "text",
          style: "muted",
          align: "center",
          text: "Compose forms for qualificators"
        },
        {
          type: "separator"
        },
        {
          type: "text",
          text: "Pick a template",
          style: "header"
        },

        {
          type: "list",
          disabled: false,
          items: [
            {
              type: "item",
              id: "contact-fields",
              title: "Contact fields",
              subtitle: "Ask for name , email & company",
              action: {
                type: "submit"
              }
            },
            {
              type: "item",
              id: "any-field",
              title: "Custom Fields",
              subtitle: "Ask for custom field data",
              action: {
                type: "submit"
              }
            }
          ]
        }
      ]

      if ctx.dig(:field, :id) == "contact-fields"

        r = QualifierRecordItem.new(
          options: fields
        )
        r.add_item("name")
        r.add_item("email")
        r.add_item("company_name")

        return {
          kind: kind,
          definitions: r.schema
        }
      end

      if ctx.dig(:field, :id) == "any-field"
        r = QualifierRecordItem.new(
          options: fields
        )

        r.add_item(nil)

        return {
          kind: kind,
          definitions: r.schema
        }
      end

      if ctx.dig(:field, :id) == "add-field"

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

      if ctx.dig(:field, :id) == "confirm" &&
         ctx.dig(:field, :action, :type) === "submit"

        # TODO: validate

        return {
          kind: "initialize",
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
        items << { name: name, label: "" }
      end

      def item(name:, label:, index:)
        [
          {
            type: "input",
            id: "item[#{index}][label]",
            placeholder: "enter your data",
            label: "Label",
            value: label
          },
          {
            type: "checkbox",
            id: "input-optional-#{index}",
            text: "optional field",
            # value: "#{index}-optional",
            options: [
              {
                type: "option",
                id: "#{index}-optional",
                name: "item[#{index}][optional]",
                text: "mark as optional"
              }
            ]
          },

          {
            type: "dropdown",
            id: "item[#{index}][name]",
            label: "Value",
            value: name,
            options: options.each_with_index.map do |o, _i|
              {
                type: "option",
                text: o["name"],
                name: o["name"],
                id: o["name"]
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
            type: "text",
            style: "header",
            align: "center",
            text: "qualify users"
          },
          {
            type: "text",
            style: "muted",
            align: "center",
            text: "Compose forms for qualificators"
          },
          {
            type: "separator"
          }
        ]
      end

      def confirm_buttons
        [
          {
            type: "button",
            id: "add-field",
            label: "Add new field",
            align: "left",
            variant: "outlined",
            action: {
              type: "submit"
            }
          },
          {
            type: "button",
            id: "confirm",
            label: "Confirm Fields",
            align: "center",
            action: {
              type: "submit"
            }
          }
        ]
      end
    end

    class QualifierRecord
      VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i.freeze

      include ActiveModel::Model
      include ActiveModel::Validations
      attr_writer :items
      attr_accessor :validatable_fields, :searcheable_fields, :optional_fields

      def self.configure(opts)
        opts.each do |o|
          attr_accessor o
        end
      end

      validate do
        validatable_fields.each do |f|
          field = f.to_sym

          case field
          when :email
            if send(field).present? && !send(field).match?(VALID_EMAIL_REGEX)
              errors.add(field,
                         I18n.t("errors.messages.invalid"))
            end
          when :phone
            if send(field).present? && !Phonelib.valid?(send(field))
              errors.add(field,
                         I18n.t("errors.messages.invalid"))
            end

          else
            if send(field).blank?
              next if optional_fields.include?(field.to_s)

              errors.add(field,
                         I18n.t("errors.messages.blank"))
            end
          end
        end
      end

      validate do
        searcheable_fields.each do |f|
          name = f["name"].to_sym

          next if send(name).blank? && optional_fields.include?(name.to_s)

          validate_field_with(name, f["type"]) if respond_to?(name) && send(name).present?
        end
      end

      def validate_field_with(name, type)
        case type
        when "string"
          # errors.add(name, I18n.t("errors.messages.invalid"))
        when "date"
          begin
            value = Date.strptime(send(name.to_sym), "%Y-%m-%d")
            send("#{name}=", value.to_s)
          rescue StandardError
            errors.add(name, I18n.t("errors.messages.invalid"))
          end
        when "integer"
          begin
            Integer(send(name.to_sym))
          rescue StandardError
            errors.add(name, I18n.t("errors.messages.invalid"))
          end
        end
      end

      def items
        @items ||= []
      end

      def add_item(name, label = nil)
        name_s = name.split("--")
        name_f = name_s.first
        optional = name_s.last == "optional" # optional_fields.include?(name.to_s)

        @items = items << {
          type: "input",
          id: name,
          placeholder: "type your #{name_f}",
          label: label,
          hint: hint_for(name_f, optional),
          value: send(name_f.to_sym),
          errors: errors[name_f.to_sym]&.uniq&.join(", "),
          action: {
            type: "submit"
          }
        }
      end

      def hint_for(name, optional)
        optional_message = optional ? "(optional)" : ""
        case name
        when "phone"
          "#{optional_message} Example: +56992302301"
        else
          "#{optional_message} Needs a valid date, Example: 2012-12-30 (YYYY-MM-DD)" if searcheable_fields.find { |o| o["name"] == name && o["type"] == "date" }
        end
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
