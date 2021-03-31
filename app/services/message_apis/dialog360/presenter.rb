module MessageApis::Dialog360
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      definitions = []
      {
        kind: 'initialize',
        definitions: definitions,
        values: {}
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      definitions = []
      {
        kind: 'submit',
        definitions: definitions,
        values: {}
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      api = ctx[:package].message_api_klass
      templates = api.retrieve_templates
      templates = JSON.parse(templates)

      pp templates

      components = templates.dig('waba_templates')
                            .reject { |o| o['status'] != 'approved' }
                            .map do |c|
        {
          type: 'item',
          id: Base64.encode64(c.to_json),
          name: 'submit-template',
          title: "Template Name: #{c['name']}",
          subtitle: "Category: #{c['category']}",
          action: { type: 'submit' }
        }
      end

      definitions = [
        {
          type: 'text',
          text: 'Whatsapp templates',
          style: 'header',
          align: 'center'
        },

        {
          type: 'text',
          text: 'Whatsapp templates',
          style: 'paragraph',
          align: 'center'
        },
        { type: 'spacer', size: 'xs' },
        { type: 'separator' },

        { type: 'list',
          disabled: false,
          items: components }
      ]

      # will submit
      if ctx.dig(:field, :name) == 'submit-template' &&
         ctx.dig(:field, :action, :type) === 'submit'

        decoded = Base64.decode64(ctx.dig(:field, :id))
        decoded = JSON.parse(decoded)

        inputs = []

        decoded['components'].each do |o|
          next if o['text'].blank?

          captures = o['text'].scan(/{{\d}}/)
          next if captures.blank?

          captures.each do |c|
            inputs << {
              type: 'input',
              id: 'unsaved-1',
              label: "parameter: #{c}",
              placeholder: c.to_s,
              # hint: (o['text']).to_s,
              save_state: 'unsaved'
            }
          end

          inputs << { type: 'spacer', size: 'm' }

          inputs << {
            type: 'text',
            text: (o['text']).to_s,
            style: 'muted'
          }
        end

        definitions = [
          {
            type: 'text',
            text: 'Whatsapp template',
            style: 'header',
            align: 'center'
          },
          {
            type: 'text',
            text: ctx.dig(:field, :title),
            style: 'muted',
            align: 'center'
          },
          { type: 'spacer', size: 'm' },
          inputs,
          {
            type: 'button',
            name: 'pick-template',
            id: ctx[:field][:id],
            variant: 'success',
            size: 'large',
            align: 'center',
            label: 'confirm',
            action: {
              type: 'submit'
            }
          }
        ].flatten

        return {
          kind: 'configure',
          definitions: definitions,
          results: {
            id: ctx.dig(:field, :id),
            label: ctx.dig(:field, :title)
          }
        }

      end

      # will send
      if ctx.dig(:field, :name) == 'pick-template'
        decoded = Base64.decode64(ctx.dig(:field, :id))
        decoded = JSON.parse(decoded)

        body = api.send_template_message(
          template: decoded,
          conversation_key: ctx[:conversation_key],
          parameters: ctx[:values]['unsaved-1']
        )

        definitions = [
          {
            type: 'text',
            text: 'template sent!',
            style: 'header',
            align: 'center'
          },
          {
            type: 'text',
            text: 'you can close this window',
            style: 'header',
            align: 'center'
          }
        ]

        if body['errors'].present?
          definitions = [
            {
              type: 'text',
              text: "#{decoded['name']} template NOT sent!",
              style: 'header',
              align: 'center'
            },
            {
              type: 'text',
              text: body['errors'].map { |o| "#{o['code']}: #{o['details']}" }.join("\n"),
              style: 'muted',
              align: 'center'
            }
          ]
        end

        return {
          kind: 'configure',
          definitions: definitions,
          results: {
            id: ctx.dig(:field, :id),
            label: ctx.dig(:field, :title)
          }
        }

      end

      { kind: kind, definitions: definitions }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params); end
  end
end
