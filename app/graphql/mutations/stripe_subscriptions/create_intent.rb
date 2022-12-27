# frozen_string_literal: true

module Mutations
  module StripeSubscriptions
    class CreateIntent < Mutations::BaseMutation
      field :redirect_url, String, null: false
      field :data, Types::JsonType, null: true
      field :errors, Types::JsonType, null: false
      argument :app_key, String, required: true
      argument :plan_id, String, required: true

      def resolve(app_key:, plan_id:)
        app = App.find_by(key: app_key)
        if app.stripe_subscription_id.present?
          update_subscription(app, plan_id)
        else
          setup_intent(app, plan_id)
        end
      end

      def setup_portal(app)
        session = Stripe::BillingPortal::Session.create({
                                                          customer: app.stripe_customer_id,
                                                          return_url: Chaskiq::Config.get("HOST") + "/apps/#{app.key}/billing/success"
                                                        })

        redirect session.url
      end

      def setup_intent(app, plan_id)
        customer_data = if app.stripe_customer_id.present?
                          { customer: app.stripe_customer_id }
                        else
                          { customer_email: app.email }
                        end

        stripe_options = {
          line_items: [{
            # Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
            price: plan_id,
            quantity: 1
          }],
          client_reference_id: app.key,
          allow_promotion_codes: true,
          mode: "subscription",
          success_url: Chaskiq::Config.get("HOST") + "/apps/#{app.key}/billing/success?{CHECKOUT_SESSION_ID}",
          cancel_url: Chaskiq::Config.get("HOST")  + "/apps/#{app.key}/billing/error",
          automatic_tax: { enabled: true }
        }.merge!(customer_data)

        session = Stripe::Checkout::Session.create(stripe_options)

        {
          redirect_url: session.url,
          errors: {}
        }
      end

      def update_subscription(app, plan_id)
        subscription = app.stripe_subscription_id
        subscription = Stripe::Subscription.retrieve(subscription)

        res = Stripe::Subscription.update(
          subscription.id,
          {
            cancel_at_period_end: false,
            proration_behavior: "create_prorations",
            items: [
              {
                id: subscription.items.data[0].id,
                price: plan_id
              }
            ]
          }
        )

        {
          redirect_url: "no",
          data: res,
          errors: {}
        }
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
