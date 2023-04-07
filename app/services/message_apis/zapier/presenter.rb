module MessageApis::Zapier
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or the home screen, so that you can render the app.
    def self.initialize_hook(ctx:, kind:)
      type_value = ctx.dig(:values, :type)
      block_type = ctx.dig(:values, :block_type)

      if type_value === "content"
        {
          # ctx: ctx,
          values: { block_type: block_type },
          definitions: [
            {
              type: "content"
            }
          ]
        }
      end
    end

    def self.content_hook(kind:, ctx:)
      {
        definitions: definitions_for_button(kind, ctx)
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button, link, or text input. This flow can occur multiple times as an end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      conversation = Conversation.find_by(key: ctx[:conversation_key])

      conversation.conversation_channels.find_or_create_by(provider: "zapier", provider_channel_id: conversation.id)

      {
        kind: "submit",
        values: {},
        definitions: definitions_for_button(kind, ctx)
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show them configuration options before it’s inserted. Leaving this option blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      results = {
        url: "/ppupu",
        type: "content",
        block_type: ctx.dig(:field, :id)
      }
      {
        kind: "initialize",
        definitions: [],
        results: results
      }
    end

    def self.definitions_for_button(kind, ctx)
      conversation = Conversation.find_by(key: ctx[:conversation_key])
      user = conversation.main_participant

      channel = conversation.conversation_channels.find_by(provider: "zapier")

      definition_button = if channel.present?
                            { type: "text", text: "Channel added", align: "center", style: "notice" }
                          else
                            {
                              id: "channel-create",
                              label: "Create a Zapier channel for this conversation",
                              align: "center",
                              type: "button",
                              action: {
                                type: "submit"
                              }
                            }
                          end

      [
        { type: "text", text: "Zapier integration", align: "center", style: "header" },
        { type: "text", text: "Adds a Zapier channel in order to notify every message to your Zaps", style: "muted" },
        definition_button
      ]
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      { a: 11_111 }
    end

    def self.sheet_view(params); end
  end
end
