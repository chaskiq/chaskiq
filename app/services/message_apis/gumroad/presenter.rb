module MessageApis::Gumroad
  class Gumroad
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      r = PaymentRecord.new(
        url: ctx.dig('values', 'url')
      )
      {
        kind: kind,
        values: {
          url: r.url
        },
        # ctx: ctx,
        definitions: r.valid_schema
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(params)
      d = params[:ctx][:values]['data']

      definitions = [
        {
          type: 'text',
          text: 'Gumroad',
          align: 'center',
          style: 'header'
        },
        {
          type: 'text',
          text: "Product #{d['product_name']}",
          align: 'center',
          style: 'paragraph'
        },
        {
          type: 'text',
          text: 'manage your membership',
          align: 'center',
          style: 'paragraph'
        },
        {
          id: 'manage-subscription',
          type: 'button',
          name: 'alooo',
          label: 'manage subscription',
          align: 'center',
          action: {
            type: 'url',
            url: d['manage_membership_url']
          },
          grid: { xs: 'w-full', sm: 'w-full' }
        }
      ]

      # if event = params.dig(:ctx, :values, 'data', 'event')
      # case event
      # when "xxxx"
      # end
      # end

      {
        kind: 'submit',
        definitions: definitions,
        results: params[:ctx][:values]
      }
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
        placeholder: 'Enter your gumroad link https://gum.co/...',
        label: 'payment url',
        value: ''
      }

      if ctx.dig(:field, :id) == 'add-url'
        r.valid?

        button.merge!({
                        value: r.url,
                        errors: r.errors[:url].join(', ')
                      })

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
          text: 'gumroad Payment Button'
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
      @user = params[:user]
      @name = @user[:name]
      @email = @user[:email]

      @url = params[:url]

      template = ERB.new <<~SHEET_VIEW
        										<html lang="en">
        											<head>
        												<meta charset="UTF-8">
        												<meta name="viewport" content="width=device-width, initial-scale=1.0">
        												<meta http-equiv="X-UA-Compatible" content="ie=edge">
        												<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600;700;800;900&display=swap" rel="stylesheet">
        												<title>[Chaskiq Article]</title>
        #{'          '}
        												<style>
        													body {
        														font-family: 'Inter', sans-serif;#{' '}
        														margin: 0px; padding: 0px;
        													}
        												</style>
        #{'          '}
        											</head>
        #{'          '}
        											<body>
        												<div class="container">
        					#{'							'}
        													<script src="https://gumroad.com/js/gumroad-embed.js"></script>
        #{'          '}
        													<script>
        #{'          '}
        														window.addEventListener(
        															'message',
        															function(e) {
        																console.log("ENENE", JSON.stringify(e))
        #{'          '}
        																if (e.data && typeof(e.data) == 'string' && JSON.parse(e.data).post_message_name === "sale") {
        																	//document.getElementById('post-message-data').innerHTML = e.data;
        																	//window.location.href = 'https://google.com';
        #{'          '}
        																	console.log("ENENE", e)
        #{'          '}
        																	setTimeout(function(){
        																		window.parent.postMessage({
        																			chaskiqMessage: true,#{' '}
        																			type: "Gumroad",#{' '}
        																			status: "submit",
        																			data: JSON.parse(e.data)
        																		}, "*")
        																	}, 3000)
        																}
        #{'          '}
        																return true
        															}
        														);
        					#{'									'}
        													</script>
        													<div class="gumroad-product-embed"#{' '}
        														data-gumroad-product-id="chaskiq-premium-support">
        														<a href="<%= @url %>">
        														Loading...
        														</a>
        													</div>
        												</div>
        #{'          '}
        											</body>
        										</html>
      SHEET_VIEW

      template.result(binding)
    end

    class PaymentRecord
      include ActiveModel::Model
      include ActiveModel::Validations
      attr_accessor :url

      validate :valid_url?

      def valid_url?
        add_error('must include valid Gumroad domain') unless url.include?('https://gum.co')
        uri = URI.parse(url)
        add_error unless uri.is_a?(URI::HTTP) && !uri.host.nil?
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
              url: '/package_iframe_internal/Gumroad'
            }
          },
          {
            type: 'text',
            text: 'This will open the Gumroad.com secure payment gateway.',
            style: 'muted',
            align: 'center'
          }
        ]
      end
    end
  end
end
