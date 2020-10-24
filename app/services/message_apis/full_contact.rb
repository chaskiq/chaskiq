# frozen_string_literal: true

module MessageApis
  class FullContact < DataEnrichmentService::Base
    attr_accessor :authorization, :params, :conn, :token

    # initialize with
    # MessageApis::FullContact.new(token: "122334456")

    # MessageApis::FullContact.new(token: token)
    # .get_data(params: {email: "miguelmichelson@gmail.com"})

    def initialize(config:)
      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
      @token = config["api_secret"]
      self
    end

    def authorize!
      @conn.authorization :Bearer, @token
    end

    def get_data(params: {})
      authorize!
      response = @conn.post('https://api.fullcontact.com/v3/person.enrich') do |req|
        req.body = params.to_json
      end

      JSON.parse(response.body, object_class: OpenStruct)
    end

    def enrich_user(user)
      response = get_data(params: {
                            email: user.email,
                            macromeasures: true
                          })

      # means an error, escape it
      return if response.status.present? && response.status >= 400

      full_name = response.fullName
      user.name = full_name
      user.first_name = full_name.split(' ')[0]
      user.last_name  = full_name.split(' ')[1]
      user.twitter    = response.twitter
      user.facebook   = response.facebook
      user.linkedin   = response.linkedin
      user.organization = response.organization
      user.job_title = response.title
      user.save
    end



    class PresenterManager
      # Initialize flow webhook URL
      # Sent when an app has been inserted into a conversation, message or 
      # the home screen, so that you can render the app.
      def self.initialize_hook(kind: , ctx:)
        type_value = ctx.dig(:values, :type)
        block_type = ctx.dig(:values, :block_type)

        puts "AAAAA #{ctx}"

        if type_value === "content"

          #case ctx.dig(:values, :block_type)
          #when 'tag-blocks'
          #when
          #else 
          #end

          return {
            #ctx: ctx,
            values: {block_type: block_type},
            definitions: [
              {
                type: 'content'
              }
            ] 
          }
        end

        definitions = [
          {
            id: 'bubu',
            label: 'this is from initialize',
            type: 'button',
            action: {
              type: "submit" 
            }
          }
        ]

        {
          #kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }

      end

      # Submit flow webhook URL
      # Sent when an end-user interacts with your app, via a button, 
      # link, or text input. This flow can occur multiple times as an 
      # end-user interacts with your app.
      def self.submit_hook(kind: , ctx:)
        conversation = Conversation.find_by(
          key: ctx.dig(:conversation_key)
        )

        app = ctx.dig(:app)
        res = app.app_package_integrations
        .joins(:app_package)
        .where("app_packages.name": "FullContact")
        .first
        .message_api_klass.enrich_user(conversation.main_participant)

        {
          definitions: [
            {
              type: 'text',
              text: 'success'
            },
            {
              type: 'text',
              text: res ? "guardó" : "no u"
            }
          ]
        }
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show 
      # them configuration options before it’s inserted. Leaving this option 
      # blank will skip configuration.
      def self.configure_hook(kind: , ctx:)

        definitions = [
          {
            id: 'bubu',
            label: 'fuckya',
            type: 'button',
            action: {
              type: "submit" 
            },
            grid: { xs: 'w-full', sm: 'w-full' }
          },
          {
            id: 'content-url',
            name: 'content-url',
            label: 'content-url',
            type: 'button',
            action: {
              type: "submit" 
            }
          }
        ]

        return  {
          kind: 'initialize', 
          definitions: [], 
          #results: results 
        }

        {
          kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }
      end
      

      def self.content_hook(kind:, ctx:)
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_view(params)
      end
    end


  end
end
