# frozen_string_literal: true

module MessageApis
  class InboxSample

    attr_accessor :secret

    def initialize(config:)

    end

    def trigger(event)
      #case event.action
      #when 'email_changed' then register_contact(event.eventable)
      #end
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      
    end

    # for display in replied message
    def self.display_data(data)
      return if data.blank?
      k = data["cancelled"] ? "canceled" : "confirmed"
      {
        "#{k}": "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}",
        formatted_text: "you are scheduled with 
        #{data['assigned_to'].join(", ")} 
        at Calendly on #{data['start_time_pretty']}"
      }
    end

    class PresenterManager



      def self.user_data
        [
          { "type": "data-table",
            "items": [{"type": "field-value","field": "Key","value": "Value 1"},
                {"type": "field-value","field": "Key","value": "Value 2"},
                {"type": "field-value","field": "Key","value": "Value 3 which is a very long value that will exhibit different behaviours to the other values"}
            ]
          }
        ]
      end

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
        ] + user_data

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
        {content: {kind: kind, ctx: ctx}}

        {
          definitions: [
            {
              type: 'text',
              text: 'success'
            }
          ]
        }
      end


      def self.base_schema
        [
    
          {
            "type":  "text",
            "text":  "Pick a template",
            "style": "header"
          },
    
          {
            type: "list",
            disabled: false,
            items: [
              {
                "type": "item",
                "id": "user-blocks",
                "title": "UserBlock",
                "subtitle": "Put some user blocks",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "item",
                "id": "tag-blocks",
                "title": "TagBlocks",
                "subtitle": "put some TagBlocks",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "item",
                "id": "user-properties-block",
                "title": "User Properties",
                "subtitle": "put some ConversationBlock",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "item",
                "id": "external-profiles",
                "title": "External Profiles",
                "subtitle": "put some ConversationBlock",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "item",
                "id": "assignee-block",
                "title": "AssigneeBlock",
                "subtitle": "put some AssigneeBlock",
                "action": {
                  "type": "submit"
                }
              },
              {
                "type": "item",
                "id": "conversation-events",
                "title": "Conversation Events",
                "subtitle": "put some Events on the sidebar",
                "action": {
                  "type": "submit"
                }
              }
            ]
          }
        ]
      end

      # Configure flow webhook URL (optional)
      # Sent when a teammate wants to use your app, so that you can show 
      # them configuration options before it’s inserted. Leaving this option 
      # blank will skip configuration.
      def self.configure_hook(kind: , ctx:)

        nonoo_definitions = [
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

        definitions = base_schema

        if ctx.dig(:field, :action, :type) === "submit"
          if false #ctx.dig(:field, :id) == "user-blocks"
            results = {
              foo: "bar",
              baz: "baaz"
            }

            return  {
              kind: 'initialize', 
              #ctx: ctx, 
              definitions: definitions, 
              results: results 
            }
          end
        end

        if ["user-properties-block", "assignee-block", "user-blocks", "tag-blocks", "conversation-block", "assignee-block", "conversation-events" ].include? ctx.dig(:field, :id )
          results = {
            url: "/ppupu",
            type: "content",
            block_type: ctx.dig(:field, :id )
          }
          return  {
            kind: 'initialize', 
            definitions: [], 
            results: results 
          }
        end

        {
          kind: kind, 
          #ctx: ctx, 
          definitions: definitions 
        }
      end
      

      def self.content_hook(kind:, ctx:)

        conversation = Conversation.find_by(key: ctx.dig(:conversation_key))
        user = conversation.main_participant

        if ctx.dig(:values, :block_type) == "user-blocks"
          
          definitions = [
            {
              type: 'list',
              items: [
                {
                  "type": "item",
                  "id": "app-user-block",
                  "title": user.display_name,
                  "subtitle": user.email,
                  "image": user.avatar_url 
                  #"action": {
                  #  "type": "submit"
                  #}
                }
              ]
            },
            {
              text: 'visit',
              type: 'text',
              align: 'right'
            }
          ]
        end

        if ctx.dig(:values, :block_type) == "conversation-events"
          definitions = [
            {
              type: 'text',
              text: "Events",
              style: 'header'
            },
            {
              type: 'list',
              items: conversation.events.order('events.id asc').map{|e|
                {
                  "type": "item",
                  "id": "event-#{e.id}",
                  "title": e.action,
                  "subtitle": I18n.l(e.created_at, format: :short),
                  "action": {
                    "type": "submit"
                  }
                }
              }
            }
          ]
        end

        if ctx.dig(:values, :block_type) == "user-properties-block"
          items_attrs = [
            'last_visited_at',
            'referrer',
            'state',
            'ip',
            'city',
            'region',
            'country',
            'web_sessions',
            'timezone',
            'browser',
            'browser_version',
            'os',
            'os_version',
            'browser_language'
          ]

          definitions = [
            { "type": "data-table",
              "items": items_attrs.map{ |i| 
                {
                  "type": "field-value",
                  "field": i, 
                  "value": user.send(i) || '-' 
                }
              }
            }
          ]
        end

        if ctx.dig(:values, :block_type) == "external-profiles"
        end

        if ctx.dig(:values, :c)
          definitions = [
            {
              text: 'foo',
              type: 'text'
            }
          ]
        end 

        if ctx.dig(:values, :block_type) == "assignee-block"
          definitions = [
            {
              type: 'text',
              text: 'Assignee',
              style: 'header'
            },
            {
              text: conversation.assignee&.display_name,
              type: 'text'
            }
          ]
        end 

        if ctx.dig(:values, :block_type) == "tag-blocks"
          definitions = [
            {
              text: 'Tags!',
              type: 'text'
            }
          ]

          definitions << {
            text: conversation.tag_list.join(", "),
            type: 'text'
          } if conversation.tag_list.any?
        end 

        {
          definitions: definitions 
        }

        
      end

      #Submit Sheet flow webhook URL (optional)
      #Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
      def self.sheet_view(params)
      end
    end
  end
end
