module MessageApis
  class Reveniu
    attr_accessor :secret

    def initialize(config:); end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id,
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      # todo, here we can do so many things like make a pause and
      # analize conversation subject or classyficators
      status = {
        '1' => 'On time',
        '2' => 'Failed Attempt 1',
        '3' => 'Failed Attempt 2',
        '4' => 'Failed Attempt 3',
        '5' => 'Failed',
        '6' => 'Not Started'
      }

      message = ConversationPart.find_by(
        key: params.dig('variables', 'input', 'external_id')
      )

      m = message.messageable
      schema = m.blocks['schema'].dup
      last_block = [
        {
          type: 'text',
          text: 'Reveniu payment result',
          style: 'header',
          align: 'center'
        },
        {
          type: 'text',
          text: "status #{status[params.dig('variables', 'input', 'status')]}",
          style: 'header',
          align: 'center'
        }
      ]

      m.blocks['schema'] = last_block
      m.save_replied(params['variables']['input'])
    end

    class PaymentRecord
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :url

      validate :valid_url?

      def valid_url?
        uri = URI.parse(url)
        add_error unless uri.is_a?(URI::HTTP) && !uri.host.nil?

        unless url.match(
          %r{https://reveniu-stage.herokuapp.com|https://reveniu.com}
        ).to_a.any?
          add_error('must include valid reveniu domain')
        end
      rescue URI::InvalidURIError
        add_error
      end

      def add_error(msg = 'valid url needed')
        errors.add(:url, msg)
      end

      def initialize(url:)
        self.url = url
      end

      def valid_schema
        # return []
        [
          {
            type: 'text',
            text: 'Payment Link',
            style: 'header',
            align: 'center'
          },
          {
            type: 'button',
            id: 'add-field',
            label: 'Enter payment gateway',
            align: 'center',
            variant: 'success',
            action: {
              type: 'frame',
              url: '/package_iframe_internal/Reveniu'
            }
          },
          {
            type: 'text',
            text: 'This will open the Reveniu.com secure payment gateway.',
            style: 'muted',
            align: 'center'
          }
        ]
      end
    end

    class PresenterManager
      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or
      # the home screen, so that you can render the app.
      def self.initialize_hook(kind:, ctx:)
        type_value = ctx.dig(:values, :type)
        block_type = ctx.dig(:values, :block_type)
        puts "AAAAA #{ctx}"

        if type_value === 'content'
          return {
            # ctx: ctx,
            kind: 'content',
            values: {
              url: ctx.dig(:values, :url)
            },
            results: {
              aaaa: 'aaaaaa'
            },
            definitions: [
              {
                type: 'content'
              }
            ]
          }
        end

        # not used (iframe version)
        r = PaymentRecord.new(
          url: ctx.dig('values', 'url')
        )
        {
          kind: kind,
          values: {
            url: r.url
          },
          definitions: r.valid_schema
        }
      end

      def self.content_hook(kind:, ctx:)
        current_user = ctx.dig(:current_user)
        button = nil

        if current_user.is_a?(AppUser)
          # access conversation part, validated by current user
          part = ctx[:current_user]
                 .conversations.find_by(key: ctx.dig(:conversation_key))
                 .messages.find_by(key: ctx.dig(:message_key))

          url = part.message.blocks.dig('values', 'url')

          @user = ctx['current_user']
          cid = ctx['message_key']
          q = "name=#{@user.name}&cid=#{cid}&auto=true"

          # url = ctx[:values][:url]
          @url = URI.escape("#{url}?#{q}")

          button = {
            id: 'is',
            type: 'button',
            variant: 'success',
            align: 'center',
            label: 'Reveniu Payment Button',
            action: {
              type: 'url',
              url: @url
            }
          }
        else
          button = {
            type: 'text',
            style: 'muted',
            align: 'center',
            text: 'A button will be displayed'
          }
        end

        {
          definitions: [
            {
              type: 'text',
              style: 'header',
              align: 'center',
              text: 'Reveniu Payment Button'
            },
            button
          ].compact
        }
      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button,
      # link, or text input. This flow can occur multiple times as an
      # end-user interacts with your app.
      def self.submit_hook(kind:, ctx:)
        r = PaymentRecord.new(
          url: ctx.dig('values', 'url')
        )
        return r.valid_schema if r.valid?

        {}
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show
      # them configuration options before it’s inserted. Leaving this option
      # blank will skip configuration.
      def self.configure_hook(kind:, ctx:)
        app = ctx[:app]
        url = ctx.dig('values', 'url')

        # fields = app.searcheable_fields
        r = PaymentRecord.new(
          url: url
        )

        button = {
          type: 'input',
          id: 'url',
          placeholder: 'Enter your gumroad link https://reveniu.com/...',
          label: 'payment url',
          value: ''
        }

        if ctx.dig(:field, :id) == 'add-url'
          r.valid?

          button.merge!({
                          value: r.url,
                          errors: r.errors[:url].join(', ')
                        })

          results = {
            url2: '/ppupu',
            url: r.url,
            type: 'content',
            block_type: 'oli'
          }

          return {
            kind: 'initialize',
            definitions: [],
            results: results
          }

          if r.valid?
            return {
              kind: 'initialize',
              results: {
                url: url
              },
              definitions: []
            }
          end
        end

        definitions = [
          {
            type: 'text',
            style: 'header',
            align: 'center',
            text: 'Reveniu Payment Button'
          },
          {
            type: 'text',
            style: 'muted',
            align: 'center',
            text: 'Add payment button'
          },
          {
            type: 'separator'
          },
          button,
          {
            type: 'button',
            id: 'add-url',
            label: 'confirm',
            align: 'left',
            variant: 'outlined',
            action: {
              type: 'submit'
            }
          }
        ]

        {
          kind: kind,
          # ctx: ctx,
          definitions: definitions
        }
      end

      # Submit Sheet flow webhook URL (optional)
      # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
        []
      end

      # Submit Sheet flow webhook URL (optional)
      # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_view(params)
        puts "##### #{params.to_json}"
        @user = AppUser.find(params[:user][:id])
        cid = params[:message_key]
        q = "email=#{@user.email}&name=#{@user.name}&cid=#{cid}&auto=true"
        url = params[:values][:url]
        # @url = "https://app.reveniu.com/checkout-custom-link/#{k}?#{q}"
        @url = URI.escape("#{url}?#{q}")

        template = ERB.new <<-EOF
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="ie=edge">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600;700;800;900&display=swap" rel="stylesheet">
              <title>[Chaskiq Article]</title>

              <style>
                body {
									font-family: 'Inter', sans-serif;#{' '}
									margin: 0px; padding: 0px;
                }
              </style>

            </head>

            <body>
							<div class="container">
								<iframe#{' '}
									sandbox="allow-top-navigation allow-forms allow-same-origin allow-scripts"
									src="<%=@url%>"#{' '}
									width="100%"#{' '}
									height="100%"#{' '}
									style="border:none">
								</iframe>
              </div>
            </body>
          </html>
        EOF

        template.result(binding)
      end
    end
  end
end
