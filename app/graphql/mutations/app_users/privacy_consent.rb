# frozen_string_literal: true

module Mutations
  module AppUsers
    class PrivacyConsent < Mutations::BaseMutation
      field :status, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :consent, Boolean, required: true

      def resolve(app_key:, consent:)
        # app = App.find_by(key: app_key)
        app_user = context[:get_app_user].call
        
        app_user.update(privacy_consent: consent)

        { status: app_user.privacy_consent }
      end

    end
  end
end
