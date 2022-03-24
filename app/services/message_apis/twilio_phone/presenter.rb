module MessageApis::TwilioPhone
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

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:); end

    def self.content_hook(kind:, ctx:)
      definitions = case ctx[:location]
                    when "fixed_sidebar"
                      content_definitions(kind: kind, ctx: ctx)
                    else
                      definitions_for_content(kind: kind, ctx: ctx)
                    end
      {
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      {}
    end

    def self.sheet_view(params)
      @url = params.dig(:values, :url)
      @conversation_key = params[:conversation_id] || params[:conversation_key]
      @message_id = params[:message_id]

      @user = params[:user] || params[:current_user]
      @name = @user[:name]
      @email = @user[:email]

      @package = AppPackageIntegration.find(params[:package_id])

      template = ERB.new <<~SHEET_VIEW
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>[Twilio phone] Widget embed API example</title>
            <link rel="stylesheet" href="<%= "#{ActionController::Base.helpers.compute_asset_path('tailwind.css')}" %>" data-turbo-track="reload" media="screen" />

            <script> window.token = "<%= self.token(@package) %>" </script>
            <script type="text/javascript" src="//sdk.twilio.com/js/client/releases/1.10.1/twilio.js"></script>


            <script type="text/javascript">
              <%= self.script(@conversation_key) %>
            </script>
          </head>

          <body>

          <% if @user["kind"] == "agent" %>
            <div class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 flex">
              <div class="max-w-3xl mx-auto justify-center items-center">
                <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div class="text-lg leading-6 font-medium text-gray-900">
                    <h3 class="panel-title">Make a call</h3>
                  </div>

                  <div class="panel-body">

                    <div class="my-2 max-w-xl text-sm text-gray-500">
                      <p><strong>Status</strong></p>

                      <div class="well well-sm" id="call-status">
                        Connecting to Twilio...
                      </div>
                    </div>

                    <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 answer-button"
                    disabled>
                      Answer call
                    </button>

                    <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hangup-button"
                    disabled onclick="hangUp()">
                      Hang up
                    </button>
                    <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 btn-notice"#{' '}
                    onclick="joinConferenceCustomer()">
                      join conference
                    </button>
                  </div>
                </div>
              </div>
            </div>

          <% end %>
          </body>
        </html>
      SHEET_VIEW

      template.result(binding)
    end

    def self.script(conversation_key)
      @conversation_key = conversation_key
      template = ERB.new <<~SHEET_VIEW

        /**
        * Twilio Client configuration for the browser-calls-rails
        * example application.
        */

        // Store some selectors for elements we'll reuse
        var callStatus,
            answerButton,
            callSupportButton,
            hangUpButton,
            callCustomerButtons = null;

        var device;

        document.addEventListener("DOMContentLoaded", function(event) {#{' '}

          console.log("Requesting Access Token...");

          callStatus = document.querySelector("#call-status");
          answerButton = document.querySelector(".answer-button");
          callSupportButton = document.querySelector(".call-support-button");
          hangUpButton = document.querySelector(".hangup-button");
          callCustomerButtons = document.querySelector(".call-customer-button");

          // Setup Twilio.Device
          device = new Twilio.Device(window.token, {
            // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
            // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
            codecPreferences: ["opus", "pcmu"],
            // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
            // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
            // a second time and sending the tone twice. This will be default in 2.0.
            fakeLocalDTMF: true,
            // Use `enableRingingState` to enable the device to emit the `ringing`
            // state. The TwiML backend also needs to have the attribute
            // `answerOnBridge` also set to true in the `Dial` verb. This option
            // changes the behavior of the SDK to consider a call `ringing` starting
            // from the connection to the TwiML backend to when the recipient of
            // the `Dial` verb answers.
            enableRingingState: true
          });

          device.on("ready", function(device) {
            console.log("Twilio.Device Ready!");
            updateCallStatus("Ready");
          });

          device.on("error", function(error) {
            console.log("Twilio.Device Error: " + error.message);
            updateCallStatus("ERROR: " + error.message);
          });

          device.on("connect", function(conn) {
            console.log("Successfully established call!");
            hangUpButton.disabled = false;
            callCustomerButtons.disabled = true;
            callSupportButton.disabled = true;
            answerButton.disabled = true;

            // If phoneNumber is part of the connection, this is a call from a
            // support agent to a customer's phone
            if ("phoneNumber" in conn.message) {
              updateCallStatus("In call with " + conn.message.phoneNumber);
            } else {
              // This is a call from a website user to a support agent
              updateCallStatus("In call with support");
            }
          });

          device.on("disconnect", function(conn) {
            // Disable the hangup button and enable the call buttons
            hangUpButton.disabled = true;
            callCustomerButtons.disabled = false;
            callSupportButton.disabled = false;

            updateCallStatus("Ready");
          });

          device.on("incoming", function(conn) {
            updateCallStatus("Incoming support call");

            // Set a callback to be executed when the connection is accepted
            conn.accept(function() {
              updateCallStatus("In call with customer");
            });

            // Set a callback on the answer button and enable it
            answerButton.click(function() {
              conn.accept();
            });
            answerButton.disabled = false;
          });
        })

        /* Helper function to update the call status bar */
        function updateCallStatus(status) {
          callStatus.textContent = status;
        }

        /* Call a customer from a support ticket */
        function callCustomer(phoneNumber) {
          updateCallStatus("Calling " + phoneNumber + "...");

          var params = {"phoneNumber": phoneNumber};
          device.connect(params);
        }

        /* Join conference */
        function joinConferenceCustomer(phoneNumber) {
          updateCallStatus("Calling " + phoneNumber + "...");

          console.log("joining", "<%= @conversation_key %>")
          var params = {"name": '<%= @conversation_key %>'};
          device.connect(params);
        }

        /* Call the support_agent from the home page */
        function callSupport() {
          updateCallStatus("Calling support...");

          // Our backend will assume that no params means a call to support_agent
          device.connect();
        }

        /* End a call */
        function hangUp() {
          device.disconnectAll();
        }



      SHEET_VIEW

      template.result(binding)
    end

    def self.token(package)
      generate_access_token(role, package)
    end

    def self.role
      "support_agent"
      # params[:page] == dashboard_path ? 'support_agent' : 'customer'
    end

    def self.generate_access_token(role, package)
      settings = package.settings
      # Create Voice grant for our token
      grant = Twilio::JWT::AccessToken::VoiceGrant.new
      grant.outgoing_application_sid = settings["application_sid"]

      # Optional: add to allow incoming calls
      grant.incoming_allow = true

      # Create an Access Token
      token = Twilio::JWT::AccessToken.new(
        settings["account_sid"],
        settings["api_key"],
        settings["api_secret"],
        [grant],
        identity: role
      )

      token.to_jwt
    end

    def self.content_definitions(kind:, ctx:)
      conferences = ctx[:package].message_api_klass.conferences_list
  
      definitions = [
        {
          type: "text",
          text: "Pick a template",
          style: "header"
        }
      ]

      definitions << {
        type: "list",
        disabled: false,
        items: conferences.map do |conf|


          data = {
            app_id: ctx[:package].app.id,
            package_id: ctx[:package].id,
            conversation_key: conf.friendly_name,
            lang: ctx[:lang],
            current_user: ctx[:current_user].as_json
          }

          token = CHASKIQ_FRAME_VERIFIER.generate(data)

          {
            type: "item",
            id: conf.sid,
            title: "#{conf.friendly_name} #{conf.status}",
            subtitle: "open conference",
            tertiary_text: "eieiei",
            action: {
              type: "url",
              url: "#{Chaskiq::Config.get(:host)}/package_iframe/TwilioPhone?token=#{token}",
              options: "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=270,left=200,top=100"
              # url: "/package_iframe_internal/TwilioPhone"
            }
          }
        end
      } if conferences.any?

      definitions
      

    end

    def self.definitions_for_content(kind:, ctx:)
      conversation = Conversation.find_by(key: ctx[:conversation_key])
      user = conversation.main_participant

      data = {
        app_id: ctx[:package].app.id,
        package_id: ctx[:package].id,
        conversation_key: ctx[:conversation_key],
        lang: ctx[:lang],
        # field: ctx[:field].as_json,
        current_user: ctx[:current_user].as_json
        # values: ctx[:values].as_json
      }

      token = CHASKIQ_FRAME_VERIFIER.generate(data)
      definitions = [
        {
          text: "New phonecall",
          type: "text",
          style: "header",
          align: "center"
        },
        {
          id: "call-button",
          name: "book-meeting",
          label: "pick the phonecall",
          type: "button",
          align: "center",
          width: "full",
          action: {
            type: "url",
            url: "#{Chaskiq::Config.get(:host)}/package_iframe/TwilioPhone?token=#{token}",
            options: "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=270,left=200,top=100"
            # url: "/package_iframe_internal/TwilioPhone"
          }
        }
      ]
    end
  end
end
