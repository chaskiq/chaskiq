# frozen_string_literal: true

module Mutations
  module QuickReplies
    class CreateQuickReply < Mutations::BaseMutation
      field :quick_reply, Types::QuickReplyType, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :content, String, required: true
      argument :title, String, required: true
      argument :lang, String, required: false, default_value: I18n.default_locale

      def resolve(app_key:, content:, title:, lang:)
        I18n.locale = lang

        app = current_user.apps.find_by(key: app_key)

        quick_reply = app.quick_replies.create(
          title: title,
          content: content
        )

        { quick_reply: quick_reply, errors: quick_reply.errors }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
