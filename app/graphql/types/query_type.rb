# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :app, Types::AppType, null: false, description: 'get app' do
      argument :key, String, required: true
    end

    def app(key:)
      @app = current_user.apps.find_by(key: key)
    end

    field :apps, [Types::AppType], null: false, description: 'get apps'

    def apps
      @app = current_user.apps
    end

    field :help_center, Types::ArticleSettingsType, null: true, description: 'help center entry point' do
      argument :domain, String, required: false
      argument :lang, String, required: false, default_value: I18n.default_locale
    end

    def help_center(domain:, lang:)
      I18n.locale = lang
      ArticleSetting.find_by(subdomain: domain)
    end

    field :user_session, Types::UserType, null: false, description: 'get current user email'
    def user_session
      current_user
    end

    field :messenger, Types::MessengerType, null: false, description: 'client messenger entry point' do
      # argument :app_key, String, required: true
    end

    def messenger
      context[:app]
    end
  end
end
