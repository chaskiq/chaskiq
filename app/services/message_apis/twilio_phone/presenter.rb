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
                      content_frame_definitions(kind: kind, ctx: ctx)
                      # content_definitions(kind: kind, ctx: ctx)
                    else
                      definitions_for_content(kind: kind, ctx: ctx)
                    end
      {
        enabled_for_agents: true,
        definitions: definitions
      }
    end

    def self.content_frame_definitions(kind:, ctx:)
      data = {
        app_id: ctx[:package].app.id,
        package_id: ctx[:package].id,
        lang: ctx[:lang],
        current_user: ctx[:current_user].as_json,
        namespace: "sidebar_frame"
      }

      token = CHASKIQ_FRAME_VERIFIER.generate(data)

      [{
        type: "frame",
        url: "#{Chaskiq::Config.get(:host)}/package_iframe/TwilioPhone?token=#{token}"
      }]
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
      @app = @package.app
      @agents_ids = MessageApis::TwilioPhone::Store.hash(@conversation_key).values

      template = case params[:namespace]
                 when "sidebar_frame" then sidebar_sheet_handler(params)
                 else
                   call_frame
                 end
      template.result(binding)
    end

    def self.call_frame
      @conversation = Conversation.find_by(key: @conversation_key)
      @profile = @conversation.main_participant.external_profiles.find_by(provider: "TwilioPhone")
      @data = {
        conversation_key: @conversation_key,
        user_key: @user["kind"],
        profile_id: @profile.profile_id,
        agents_id: @agents_ids,
        user: @user
      }.to_json

      template = ERB.new <<~SHEET_VIEW
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <meta name="app-id" content="<%= @app.key %>"/>
            <meta name="chaskiq-ws" content="<%= Chaskiq::Config.get('WS') %>"/>
            <title>Call <%= @profile.profile_id %></title>
            <script> window.token = "<%= MessageApis::TwilioPhone::Api.token(@package) %>" </script>
            <script type="text/javascript" src="//sdk.twilio.com/js/client/releases/1.10.1/twilio.js"></script>
            <meta name="data" content='<%= @data %>'/>
            <meta name="content-type" content='call'/>
            <meta name="endpoint-url" content='<%= @package.hook_url %>'/>

            <script>
              window.domain="<%= Rails.application.config.action_controller.asset_host %>";
            </script>

            <script src="<%= "#{ActionController::Base.helpers.compute_asset_path('internal_package_socket.js')}" %>"></script>

            <link rel="stylesheet" href="<%= "#{ActionController::Base.helpers.compute_asset_path('tailwind.css')}" %>" data-turbo-track="reload" media="screen" />

          </head>

          <body>

          <div id="content"></div>

          </body>
        </html>
      SHEET_VIEW
    end

    def self.sidebar_sheet_handler(params)
      case params[:action]
      when :update
        update_record
      else
        sidebar_sheet
      end
    end

    def update_record
      "console.log('aollaaaaa')"
    end

    def self.sidebar_sheet
      @agent_in_call = MessageApis::TwilioPhone::Store.locked_agents(@app.key).elements.include?(@user["id"].to_s)
      @user_token = CHASKIQ_FRAME_VERIFIER.generate(@user)
      @data = {
        conferences: conferences_list_object,
        agent_in_call: @agent_in_call
      }.to_json

      template = ERB.new <<~SHEET_VIEW
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>[Twilio phone]</title>

            <meta name="app-id" content="<%= @app.key %>"/>
            <meta name="chaskiq-ws" content="<%= Chaskiq::Config.get('WS') %>"/>
            <script> window.token = "<%= MessageApis::TwilioPhone::Api.token(@package) %>" </script>

            <meta name="content-type" content='call-list'/>
            <meta name="data" content='<%= @data %>'/>
            <meta name="user-token" content='<%= @user_token %>'/>

            <meta name="endpoint-url" content='<%= @package.hook_url %>'/>

            <script src="<%= "#{ActionController::Base.helpers.compute_asset_path('internal_package_socket.js')}" %>"></script>
            <link rel="stylesheet" href="<%= "#{ActionController::Base.helpers.compute_asset_path('tailwind.css')}" %>" data-turbo-track="reload" media="screen" />
          </head>
          <body>
            <div id="content">
            </div>
          </body>
        </html>
      SHEET_VIEW
    end

    def self.conferences_list_object
      @conferences = @package.message_api_klass.conferences_list

      @conferences.map do |conf|
        MessageApis::TwilioPhone::Api.conference_json_item(conf, @package)
      end.compact
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

      if conferences.any?
        definitions << {
          type: "list",
          disabled: false,
          items: conferences.map do |conf|
            agent_ids = MessageApis::TwilioPhone::Store.hash(conf.friendly_name).values
            agents = Agent.find(agent_ids).map(&:display_name)

            data = {
              app_id: ctx[:package].app.id,
              package_id: ctx[:package].id,
              conversation_key: conf.friendly_name,
              lang: ctx[:lang],
              agents_ids: agents_ids,
              agents_names: agents.map(&:display_name),
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
        }
      end

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
