module MessageApis::OpenAi
  class Presenter
    # Initialize flow webhook URL
    # Sent when an app has been inserted into a conversation, message or
    # the home screen, so that you can render the app.
    def self.initialize_hook(kind:, ctx:)
      record = MessageApis::OpenAi::PromptRecord.new(prompt: ctx.dig(:values, :prompt))
      {
        kind: kind,
        # ctx: ctx,
        definitions: record.success_schema
      }
    end

    # Submit flow webhook URL
    # Sent when an end-user interacts with your app, via a button,
    # link, or text input. This flow can occur multiple times as an
    # end-user interacts with your app.
    def self.submit_hook(kind:, ctx:)
      if ctx["field"]["id"] == "prompt-ok"
        message = ConversationPart.find_by(key: ctx["message_key"])

        conversation = message.conversation

        prompt_field = message.message.blocks["schema"].find { |o| o["id"] == "prompt-value" }

        conversation.conversation_channels.create({
                                                    provider: "open_ai",
                                                    provider_channel_id: conversation.id,
                                                    data: { prompt: prompt_field["value"] }
                                                  })

        return {
          results: {
            start: "yes"
          },
          definitions: [
            { type: "text", text: "You have started the conversation", style: "header" }
          ]
        }

      end

      if ctx["field"]["id"] == "prompt-no"
        {
          results: {
            start: "no"
          },
          definitions: [
            { type: "text", text: "you cancelled the conversation", style: "header" }
          ]
        }
      end
    end

    # Configure flow webhook URL (optional)
    # Sent when a teammate wants to use your app, so that you can show
    # them configuration options before it’s inserted. Leaving this option
    # blank will skip configuration.
    def self.configure_hook(kind:, ctx:)
      label = "epa"
      app = ctx[:package].app

      default_prompt = ctx[:package].settings["main_prompt"]

      value = ctx.dig(:values, :prompt)
      value = default_prompt if ctx.dig(:field, :action, :type) != "submit"

      record = MessageApis::OpenAi::PromptRecord.new(prompt: value)
      schema = record.default_schema

      if ctx.dig(:field, :action, :type) != "submit"
        schema = record.default_schema
      elsif record.prompt.present?
        if record.valid?
          kind = "initialize"
          schema = record.success_schema
        else
          schema = record.error_schema
        end
      end

      if ctx.dig(:field, :id) == "add-prompt" &&
         ctx.dig(:field, :action, :type) === "submit"

        # TODO: validate

        return {
          kind: "initialize",
          definitions: schema,
          results: ctx[:values]
        }
      end

      {
        kind: kind,
        definitions: schema
      }
    end

    # Submit Sheet flow webhook URL (optional)
    # Sent when a sheet has been submitted. A sheet is an iframe you’ve loaded in the Messenger that is closed and submitted when the Submit Sheets JS method is called.
    def self.sheet_hook(params)
      []
    end
  end

  class PromptRecord
    include ActiveModel::Model
    include ActiveModel::Validations
    attr_accessor :prompt

    def initialize(prompt:)
      self.prompt = prompt
    end

    def default_schema
      [
        { type: "text", text: "Open AI ChatGPT", style: "header" },
        { type: "text", text: "Configure your bot", style: "muted" },
        { type: "textarea",
          id: "prompt",
          name: "prompt",
          label: "System prompt",
          placeholder: "Enter prompt here...",
          value: send(:prompt),
          errors: errors[:prompt]&.uniq&.join(", ") },
        {
          type: "button",
          id: "add-prompt",
          variant: "outlined",
          size: "small",
          label: "save prompt",
          action: {
            type: "submit"
          }
        }
      ]
    end

    def error_schema
      [
        { type: "text", text: "This is a header", style: "header" },
        { type: "text", text: "This is a header", style: "muted" },
        { type: "textarea",
          id: "textarea-3",
          name: "textarea-3",
          label: "Error",
          placeholder: "Enter text here...",
          value: send(:prompt),
          errors: errors[:prompt]&.uniq&.join(", ") },
        {
          type: "button",
          id: "add-prompt",
          variant: "outlined",
          size: "small",
          label: "save prompt",
          action: {
            type: "submit"
          }
        }
      ]
    end

    def schema
      [
        { type: "text", text: "This is a header", style: "header" },
        { type: "text", text: "This is a header", style: "muted" }
      ]
    end

    def success_schema
      [
        { type: "text", text: "Open AI conversation", style: "header" },
        { type: "text", text: "you are going to start a conversation with GPT-3 bot", style: "muted" },
        { type: "hidden", value: send(:prompt), id: "prompt-value" },
        {
          type: "button",
          id: "prompt-ok",
          variant: "success",
          align: "center",
          size: "medium",
          label: "Start chat",
          action: {
            type: "submit"
          }
        },
        {
          type: "button",
          id: "prompt-no",
          variant: "link",
          size: "medium",
          align: "center",
          label: "Cancel",
          action: {
            type: "submit"
          }
        }
      ]
    end
  end
end
