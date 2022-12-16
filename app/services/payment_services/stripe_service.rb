module PaymentServices
  class StripeService
    def self.sync_subscription(app)
      subscription = new.get_subscription(app.stripe_subscription_id)
      app.update({
                   stripe_subscription_id: subscription.id,
                   stripe_subscription_plan_id: subscription.plan.id,
                   stripe_subscription_status: subscription.status
                 })
    end

    def get_plans
      res = Stripe::Price.list(limit: 20).data
      data = res.filter do |o|
        Plan.all.pluck(:id).include?(o.id)
      end

      data.map do |o|
        p = Plan.get_by_id(o.id)
        {
          id: o.id,
          source: "stripe",
          features: p["features"],
          name: p["name"],
          pricing: o.unit_amount / 100
        }
      end
    end

    def get_subscription(id)
      Stripe::Subscription.retrieve id
    end

    def get_subscription_transactions(app)
      id = app.payment_attribute("customer_id")
      return [] if id.blank?

      Stripe::Invoice.list({ limit: 24, customer: id }).data.map do |o|
        {
          id: o.id,
          status: o.status,
          receipt_url: o.invoice_pdf,
          receipt_hosted: o.hosted_invoice_url,
          amount: o.amount_paid / 100,
          currency: o.currency,
          created_at: I18n.l(Time.zone.at(o.created), format: :short)
        }
      end
    end
  end
end
