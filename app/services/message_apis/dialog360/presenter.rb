module MessageApis::Dialog360
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      definitions = []
      {
        kind: "initialize",
        definitions: definitions,
        values: {}
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      definitions = []
      {
        kind: "submit",
        definitions: definitions,
        values: {}
      }
    end

    def self.search_participant(ctx:)
      api = ctx[:package].message_api_klass

      definitions = [
        {
          type: "input",
          id: "unsaved-2",
          name: "search_contact",
          label: "Search contact by email, name or phone",
          placeholder: "Search for a contact...",
          save_state: "unsaved",
          action: {
            type: "submit"
          }
        },
        {
          type: "spacer",
          size: "m"
        }
      ]

      if (term = ctx.dig("values", "search_contact")) && term.present?

        query_term = :last_name_or_first_name_or_name_or_email_or_phone_or_external_profiles_profile_id_i_cont_any
        items = ctx[:package].app.app_users.limit(15).ransack(
          query_term => term
        ).result

        collection = items.map do |c|
          {
            type: "item",
            id: c.id,
            name: "selected-user",
            title: "#{c.type}: #{c.display_name} #{c.email}",
            subtitle: "Phone: #{c.phone} | #{api.get_profile_for_participant_label(c)}",
            action: { type: "submit" }
          }
        end

        if collection.any?
          definitions << {
            type: "list",
            disabled: false,
            items: collection
          }
        end
      end

      # Rails.logger.info definitions

      {
        definitions: definitions
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    #
    # rubocop:disable Metrics/PerceivedComplexity
    def self.configure_hook(kind:, ctx:)
      offset_page = if ctx.dig("field", "name") == "paginate-template"
                      ctx.dig("field", "id").gsub("paginate-template-", "").to_i
                    else
                      0
                    end

      # Rails.logger.info "::::: CTX:::::"
      # Rails.logger.info ctx

      return search_participant(ctx: ctx) if ctx[:conversation_key].blank? && ctx.dig("field", "name") != "selected-user" && ctx.dig("values", "selected_user").blank?

      api = ctx[:package].message_api_klass
      templates = api.retrieve_templates(offset: offset_page)
      templates = JSON.parse(templates)
      per = 10

      if templates.dig("meta", "success") == false
        return { kind: kind, definitions: [
          { type: "text", text: "Error retrieving templates #{templates.dig('meta', 'developer_message')}" }
        ] }
      end

      offset = templates["offset"]
      paginate_button = nil
      # Rails.logger.debug templates
      # Rails.logger.debug ctx

      next_page_value = templates["offset"] + per
      next_button = nil
      if next_page_value <= templates["total"]
        next_button = {
          type: "button",
          name: "paginate-template",
          id: "paginate-template-#{next_page_value}",
          variant: "success",
          size: "small",
          align: "center",
          label: "Next ->",
          action: {
            type: "submit"
          }
        }
      end

      prev_page_value = templates["offset"] - per

      prev_button = nil
      unless templates["offset"].zero?
        prev_button = {
          type: "button",
          name: "paginate-template",
          id: "paginate-template-#{prev_page_value}",
          variant: "success",
          size: "small",
          align: "center",
          label: "<- Prev",
          action: {
            type: "submit"
          }
        }
      end

      Rails.logger.debug templates

      components = templates["waba_templates"]
                   .select { |o| o["status"] == "approved" }
                   .map do |c|
        {
          type: "item",
          id: Base64.encode64(c.to_json),
          name: "submit-template",
          title: "Template Name: #{c['name']}",
          subtitle: "Category: #{c['category']}",
          action: { type: "submit" }
        }
      end

      definitions = [
        {
          type: "text",
          text: "Whatsapp templates",
          style: "header",
          align: "center"
        },
        {
          type: "text",
          text: "Whatsapp templates",
          style: "paragraph",
          align: "center"
        },
        { type: "spacer", size: "xs" },
        { type: "separator" },
        {
          type: "list",
          disabled: false,
          items: components
        },
        prev_button,
        next_button
      ].compact

      if ctx.dig("field", "name") == "selected-user"
        definitions << {
          value: ctx.dig("field", "id"),
          name: "selected_user",
          type: "hidden",
          id: "selected_user"
        }
      end

      # will submit
      if ctx.dig(:field, :name) == "submit-template" &&
         ctx.dig(:field, :action, :type) === "submit"

        decoded = Base64.decode64(ctx.dig(:field, :id))
        decoded = JSON.parse(decoded)

        inputs = []

        decoded["components"].each do |o|
          next if o["text"].blank?

          captures = o["text"].scan(/{{\d}}/)
          next if captures.blank?

          captures.each do |c|
            inputs << {
              type: "input",
              id: "unsaved-1",
              label: "parameter: #{c}",
              placeholder: c.to_s,
              # hint: (o['text']).to_s,
              save_state: "unsaved"
            }
          end

          inputs << { type: "spacer", size: "m" }

          inputs << {
            type: "text",
            text: (o["text"]).to_s,
            style: "muted"
          }
        end

        definitions = [
          {
            type: "text",
            text: "Whatsapp template",
            style: "header",
            align: "center"
          },
          {
            type: "text",
            text: ctx.dig(:field, :title),
            style: "muted",
            align: "center"
          },
          { type: "spacer", size: "m" },
          inputs,
          {
            type: "button",
            name: "pick-template",
            id: ctx[:field][:id],
            variant: "success",
            size: "large",
            align: "center",
            label: "confirm",
            action: {
              type: "submit"
            }
          }
        ].flatten

        if ctx.dig("values", "selected_user").present?
          definitions << {
            value: ctx.dig("values", "selected_user"),
            name: "selected_user",
            type: "hidden",
            id: "selected_user"
          }
        end

        return {
          kind: "configure",
          definitions: definitions,
          results: {
            id: ctx.dig(:field, :id),
            label: ctx.dig(:field, :title)
          }
        }

      end

      # will send
      if ctx.dig(:field, :name) == "pick-template"
        decoded = Base64.decode64(ctx.dig(:field, :id))
        decoded = JSON.parse(decoded)

        body = api.send_template_message(
          template: decoded,
          selected_user: ctx[:values]["selected_user"],
          conversation_key: ctx[:conversation_key],
          parameters: ctx[:values]["unsaved-1"]
        )

        if body.is_a?(Hash) && body["errors"].blank?
          definitions = [
            {
              type: "text",
              text: "template sent!",
              style: "header",
              align: "center"
            },
            {
              type: "text",
              text: "you can close this window",
              style: "header",
              align: "center"
            },
            {
              id: "visit-link",
              type: "button",
              label: "Visit conversation",
              action: {
                type: "link",
                url: "/apps/#{ctx['package'].app.key}/conversations/#{body['conversation_key']}"
              },
              align: "center"
            }
          ]
        end

        # Rails.logger.info(body)

        if body.is_a?(Hash) && body["errors"].present?
          definitions = [
            {
              type: "text",
              text: "#{decoded['name']} template NOT sent!",
              style: "header",
              align: "center"
            },
            {
              type: "text",
              text: body["errors"].map { |o| "#{o['code']}: #{o['details']}" }.join("\n"),
              style: "muted",
              align: "center"
            }
          ]
        end

        return {
          kind: "configure",
          definitions: definitions,
          results: {
            id: ctx.dig(:field, :id),
            label: ctx.dig(:field, :title)
          }
        }

      end

      { kind: kind, definitions: definitions }
    end
    # rubocop:enable Metrics/PerceivedComplexity

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params); end
  end
end
