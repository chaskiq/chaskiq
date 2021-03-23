module MessageApis::InboxSections
  class Presenter
    def self.user_data
      [
        { type: 'data-table',
          items: [
            { type: 'field-value', field: 'Key', value: 'Value 1' },
            { type: 'field-value', field: 'Key', value: 'Value 2' },
            { type: 'field-value', field: 'Key', value: 'Value 3 which is a very long value that will exhibit different behaviours to the other values' }
          ] }
      ]
    end

    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      type_value = ctx.dig(:values, :type)
      block_type = ctx.dig(:values, :block_type)

      if type_value === 'content'

        # case ctx.dig(:values, :block_type)
        # when 'tag-blocks'
        # when
        # else
        # end

        return {
          # ctx: ctx,
          values: { block_type: block_type },
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
            type: 'submit'
          }
        }
      ] + user_data

      {
        # kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      { content: { kind: kind, ctx: ctx } }

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
          type: 'text',
          text: 'Pick a template',
          style: 'header'
        },

        {
          type: 'list',
          disabled: false,
          items: [
            {
              type: 'item',
              id: 'user-blocks',
              title: 'UserBlock',
              subtitle: 'Put some user blocks',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'tag-blocks',
              title: 'TagBlocks',
              subtitle: 'put some TagBlocks',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'user-properties-block',
              title: 'User Properties',
              subtitle: 'put some ConversationBlock',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'external-profiles',
              title: 'External Profiles',
              subtitle: 'put some ConversationBlock',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'assignee-block',
              title: 'AssigneeBlock',
              subtitle: 'put some AssigneeBlock',
              action: {
                type: 'submit'
              }
            },
            {
              type: 'item',
              id: 'conversation-events',
              title: 'Conversation Events',
              subtitle: 'put some Events on the sidebar',
              action: {
                type: 'submit'
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
    def self.configure_hook(kind:, ctx:)
      nonoo_definitions = [
        {
          id: 'bubu',
          label: 'fuckya',
          type: 'button',
          action: {
            type: 'submit'
          },
          grid: { xs: 'w-full', sm: 'w-full' }
        },
        {
          id: 'content-url',
          name: 'content-url',
          label: 'content-url',
          type: 'button',
          action: {
            type: 'submit'
          }
        }
      ]

      definitions = base_schema

      if %w[user-properties-block
            assignee-block
            user-blocks
            tag-blocks
            conversation-block
            assignee-block
            conversation-events
            external-profiles].include? ctx.dig(:field, :id)
        results = {
          url: '/ppupu',
          type: 'content',
          block_type: ctx.dig(:field, :id)
        }
        return {
          kind: 'initialize',
          definitions: [],
          results: results
        }
      end

      {
        kind: kind,
        # ctx: ctx,
        definitions: definitions
      }
    end

    def self.content_hook(kind:, ctx:)
      conversation = Conversation.find_by(key: ctx[:conversation_key])
      user = conversation.main_participant

      if ctx.dig(:values, :block_type) == 'user-blocks'

        definitions = [
          {
            type: 'text',
            text: user.display_name.empty? ? '---' : user.display_name,
            style: 'header',
            align: 'center'
          },

          {
            type: 'image',
            url: user.avatar_url,
            height: 64,
            width: 64,
            align: 'center',
            rounded: true
          }
        ]

        if user.email.present?
          definitions << {
            type: 'text',
            text: user.email,
            style: 'muted',
            align: 'center'
          }
        end

        definitions << {
          id: 'visit-user-profile',
          label: 'visit',
          type: 'button',
          variant: 'link',
          align: 'right',
          action: {
            type: 'link',
            url: "/apps/#{conversation.app.key}/users/#{user.id}"
          }
        }

        definitions
      end

      if ctx.dig(:values, :block_type) == 'conversation-events'
        definitions = [
          {
            type: 'text',
            text: 'Events',
            style: 'header'
          },
          {
            type: 'list',
            items: conversation.events.order('events.id asc').map do |e|
                     {
                       type: 'item',
                       id: "event-#{e.id}",
                       title: e.action,
                       subtitle: I18n.l(e.created_at, format: :short),
                       action: {
                         type: 'submit'
                       }
                     }
                   end
          }
        ]
      end

      if ctx.dig(:values, :block_type) == 'user-properties-block'
        items_attrs = [
          { label: 'Last Seen', call: lambda { |u|
                                        begin
                                          I18n.l(u.last_visited_at, format: :short)
                                        rescue StandardError
                                          nil
                                        end
                                      } },
          { label: 'Location', call: ->(u) { [u.region, u.city, u.country].compact.join(', ') } },
          { label: 'Ip', call: ->(u) {} },
          { label: 'Sessions', call: ->(u) { u.web_sessions } },
          { label: 'Timezone', call: ->(u) {} },
          { label: 'Browser', call: ->(u) { [u.browser, u.browser_version].join(', ') } },
          { label: 'OS', call: ->(u) { [u.os, u.os_version].join(', ') } },
          { label: 'Language', call: ->(u) { u.browser_language } },
          { label: 'Referrer', call: ->(u) { u.referrer } }
        ]

        definitions = [
          {
            type: 'text',
            text: 'Contact\'s browsing properties',
            style: 'header'
          },
          { type: 'data-table',
            items: items_attrs.map do |i|
                     {
                       type: 'field-value',
                       field: i[:label],
                       value: i[:call].call(user)
                     }
                   end }
        ]
      end

      if ctx.dig(:values, :block_type) == 'external-profiles'

        tables = user.external_profiles.map do |o|
          { type: 'data-table',
            items: [
              { type: 'field-value', field: 'Name', value: o['provider'] },
              { type: 'field-value', field: 'External id', value: o['profile_id'] }
            ] }
        end

        if tables.empty?
          tables = {
            type: 'text',
            text: 'no external profiles found',
            style: 'muted',
            align: 'center'
          }
        end

        definitions = [
          {
            type: 'text',
            text: 'Contact\'s External profiles',
            style: 'header'
          },
          tables
        ].flatten
      end

      if ctx.dig(:values, :c)
        definitions = [
          {
            text: 'foo',
            type: 'text'
          }
        ]
      end

      if ctx.dig(:values, :block_type) == 'assignee-block'
        assignee = conversation&.assignee

        definitions = [
          {
            type: 'text',
            text: 'Assignee',
            style: 'header'
          }
        ]

        unless assignee.present?
          definitions << {
            text: 'unassigned',
            type: 'text',
            style: 'muted',
            align: 'center'
          }
        end

        if assignee.present?
          assignee_name = if assignee&.display_name&.empty?
                            assignee&.email
                          else
                            assignee&.display_name
                          end

          definitions << {
            text: assignee_name,
            type: 'text'
          }

          definitions << {
            id: 'visit-agent-profile',
            label: 'visit',
            type: 'button',
            variant: 'link',
            align: 'right',
            action: {
              type: 'link',
              url: "/apps/#{conversation.app.key}/agents/#{assignee.id}"
            }
          }
        end
      end

      if ctx.dig(:values, :block_type) == 'tag-blocks'
        definitions = [
          {
            text: 'Conversation Tags',
            type: 'text',
            style: 'header'
          }
        ]

        definitions << if conversation.tag_list.any?
                         {
                           text: conversation.tag_list.join(', '),
                           type: 'text'
                         }
                       else
                         {
                           text: 'no tags found',
                           type: 'text',
                           style: 'muted',
                           align: 'center'
                         }
                       end
      end

      {
        definitions: definitions
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_view(params); end
  end
end
