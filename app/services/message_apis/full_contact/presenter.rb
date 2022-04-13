module MessageApis::FullContact
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      type_value = ctx.dig(:values, :type)
      block_type = ctx.dig(:values, :block_type)
      {
        # ctx: ctx,
        values: { block_type: },
        definitions: [
          {
            type: "content"
          }
        ]
      }
    end

    def self.user_attrs
      items_attrs = [
        { label: I18n.t("full_contact.inbox.name"), call: ->(user) { user.name } },
        { label: I18n.t("full_contact.inbox.first_name"), call: ->(user) { user.first_name } },
        { label: I18n.t("full_contact.inbox.last_name"), call: ->(user) { user.last_name } },
        { label: I18n.t("full_contact.inbox.twitter"), call: ->(user) { user.twitter } },
        { label: I18n.t("full_contact.inbox.facebook"), call: ->(user) { user.facebook } },
        { label: I18n.t("full_contact.inbox.linkedin"), call: ->(user) { user.linkedin } },
        { label: I18n.t("full_contact.inbox.organization"), call: ->(user) { user.organization } },
        { label: I18n.t("full_contact.inbox.job_title"), call: ->(user) { user.job_title } }
      ]
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      conversation = Conversation.find_by(
        key: ctx[:conversation_key]
      )
      user = conversation.main_participant
      app = ctx[:package].app
      res = ctx[:package].message_api_klass.enrich_user(user)

      definitions = [
        {
          type: "text",
          text: "FullContact",
          style: "header"
        },
        {
          id: "fullcontact-enrich-btn",
          label: "Enrich with Fullcontact",
          type: "button",
          action: {
            type: "submit"
          }
        }
      ]

      definitions << {
        type: "data-table",
        items: user_attrs.map do |o|
                 { type: "field-value",
                   field: o[:label],
                   value: o[:call].call(user) }
               end
      }

      # {
      #  type: 'text',
      #  text: res ? "guardó" : "no u"
      # }

      {
        definitions:
      }
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show
    # them configuration options before it’s inserted. Leaving this option
    # blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      {
        kind: "initialize",
        definitions: []
        # results: results
      }
    end

    def self.content_hook(kind:, ctx:)
      conversation = Conversation.find_by(
        key: ctx[:conversation_key]
      )
      user = conversation.main_participant

      definitions = [
        {
          type: "text",
          text: "FullContact",
          style: "header"
        }
      ]
      definitions << {
        type: "data-table",
        items: user_attrs.map do |o|
                 { type: "field-value",
                   field: o[:label],
                   value: o[:call].call(user) }
               end
      }

      definitions << {
        id: "fullcontact-enrich-btn",
        label: "Enrich with Fullcontact",
        type: "button",
        action: {
          type: "submit"
        }
      }

      {
        definitions:
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_view(params); end
  end
end
