# frozen_string_literal: true

module Mutations
  module StripeSubscriptions
    class CustomerPortal < Mutations::BaseMutation
      field :redirect_url, String, null: false
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true

      def resolve(app_key:)
        app = App.find_by(key: app_key)
        setup_portal(app)
      end

      private

      def setup_portal(app)
        session = Stripe::BillingPortal::Session.create({
                                                          customer: app.stripe_customer_id,
                                                          return_url: Chaskiq::Config.get("HOST") + "/apps/#{app.key}/billing"
                                                        })

        {
          redirect_url: session.url,
          errors: nil
        }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
