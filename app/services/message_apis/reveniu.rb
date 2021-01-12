module MessageApis
	class Reveniu

    attr_accessor :secret

    def initialize(config:)

		end
		
    class PaymentRecord
      include ActiveModel::Model
      include ActiveModel::Validations
			attr_accessor :url
			
			validate :valid_url?

			def valid_url?
				uri = URI.parse(url)
				unless uri.is_a?(URI::HTTP) && !uri.host.nil?
					errors.add(:url, "valid url needed")
				end
			rescue URI::InvalidURIError
				errors.add(:url, "valid url needed")
			end

			def initialize(url:)
				self.url = url
			end
      
      def valid_schema
        #return []
        [
          {
            type:  "text",
            text:  "Payment Link",
						style: "header",
						align: "center"
					},
					{
						type: 'button',
						id: 'add-field',
						label: 'Enter payment gateway',
						align: 'center',
						variant: 'contained',
						action: {
							type: 'frame',
							url: '/package_iframe_internal/Reveniu'
						}
					},
          {
            "type":  "text",
            "text":  "This is a secure payment link from Reveniu.com. ",
            "style": "paragraph"
          }
        ]
      end

    end

		class PresenterManager

      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or 
      # the home screen, so that you can render the app.
			def self.initialize_hook(kind: , ctx:)
				r = PaymentRecord.new(
					url: ctx.dig("values", "url")
				)
        {
          kind: kind, 
          #ctx: ctx, 
          definitions: r.valid_schema 
        }
      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button, 
      # link, or text input. This flow can occur multiple times as an 
      # end-user interacts with your app.
			def self.submit_hook(kind:, ctx:)
				r = PaymentRecord.new(
					url: ctx.dig("values", "url")
				)
				return r.valid_schema if r.valid?
        {}
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show 
      # them configuration options before it’s inserted. Leaving this option 
      # blank will skip configuration.
      def self.configure_hook(kind: , ctx:)
				app = ctx[:app]
				url = ctx.dig("values", "url")
				#fields = app.searcheable_fields
				r = PaymentRecord.new(
					url: url
				)

				button = {
					"type": "input",
					"id": "url",
					"placeholder": 'enter your data',
					"label": "payment url",
					value: kind,
					placeholder: 'http://reveniu'
				}

				if ctx.dig(:field, :id) == "add-url"
          puts "VALID? #{r.valid?}"
        
          button = {
						"type": "input",
						"id": "url",
						"placeholder": 'enter your data',
						"label": "payment url",
						value: kind,
						errors: r.errors[:url],
						placeholder: 'http://reveniu'
					}

					return {
						kind: 'initialize', 
						results: {
							url: url
						},
						definitions: [] 
					} if r.valid?
				end
				
        definitions = [
          {
            type: 'text',
            style: 'header',
            align: 'center',
            text: "Reveniu Payment Button"
          },
          {
            type: 'text',
            style: 'muted',
            align: 'center',
            text: "Add payment button"
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


				
        return {
          kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_hook(params)
        []
			end
			

			#Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_view(params)
        @user = params[:user]
        @name = @user[:name]
				@email = @user[:email]
				
				@url = "https://app.reveniu.com/checkout-custom-link/Ggpv1Lw13aj7v99Wuwk6rL9wvb9gmGJP"

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
									font-family: 'Inter', sans-serif; 
									margin: 0px; padding: 0px;
                }
              </style>

            </head>

            <body>
							<div class="container">
								<!--
                <div id="main-page">
                  Hello my friend #{@user.to_json}
								</div>
								-->
								
								<iframe src="<%=@url%>" width="100%" height="100%" style="border:none"></iframe>
              </div>

            </body>
          </html>
        EOF

        template.result(binding)
      end

		end
	end
end