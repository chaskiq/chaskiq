module MessageApis::Zoom
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(params)
      url = params[:ctx][:values][:email]
      {
        kind: 'initialize',
        definitions: definitions_for_initialize(params),
        values: {
          email: params.dig(:ctx, :values, :email)
        }
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(params)
      []
    end

    def self.definitions_for_configure_hook
      zoom_input = {
        type: 'input',
        id: 'zoom_user',
        placeholder: 'enter your zoom user email',
        label: 'Zoom user'
      }

      action = {
        id: 'set-url',
        name: 'set_url',
        label: 'Set up',
        type: 'button',
        action: {
          type: 'submit'
        }
      }

      [
        zoom_input,
        action
      ]
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      definitions = definitions_for_configure_hook

      if ctx.dig(:field, :name) == 'set_url' &&
         ctx.dig(:field, :action, :type) === 'submit'

        email = ctx.dig(:values, :zoom_user)

        if email.blank?
          input = zoom_input
          input.merge!(
            errors: 'not a valid url',
            value: email
          )

          definitions = [
            input,
            action
          ]
          return {
            kind: kind,
            definitions: definitions
          }
        end

        return {
          kind: 'initialize',
          definitions: definitions,
          results: {
            email: email
          }
        }

        #         error_definitions = [{
        #           type: 'text',
        #           text: 'There was an error creating the ZOOM metting',
        #           style: 'header'
        #         },
        #         {
        #           type: 'text',
        #           text: response['message'],
        #           style: 'muted'
        #         },
        #         {
        #           name: 'a',
        #           label: 'a separator',
        #           action: {},
        #           type: 'separator'
        #         }]
        #
        #         return {
        #           kind: kind,
        #           definitions: error_definitions + definitions
        #         }
      end

      { kind: kind, ctx: ctx, definitions: definitions }
    end

    def self.definitions_for_initialize(params)
      [
        {
          type: 'text',
          style: 'header',
          text: 'Your zoom meeting is ready',
          align: 'left'
        },
        {
          type: 'text',
          text: "pass: #{params[:ctx][:values][:password]}",
          align: 'left'
        },
        {
          id: 'join-url',
          type: 'button',
          align: 'left',
          label: 'Join',
          width: 'full',
          action: {
            type: 'url',
            url: params[:ctx][:values][:join_url]
          }
        },
        {
          type: 'text',
          text: "Status: #{params[:ctx][:values][:status]}",
          align: 'left'
        }
      ]
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params); end

    def self.sheet_view(params); end
  end
end
