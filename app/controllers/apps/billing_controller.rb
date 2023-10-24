class Apps::BillingController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def transactions
    @transactions = begin
      @app.payment_service.new.get_subscription_transactions(@app)
    rescue StandardError
      []
    end
  end

  def new
    url = setup_intent(@app, params[:plan_id])
    redirect_to url, allow_other_host: true
  end

  def show; end

  def success
    @status = "success"
    render "show"
  end

  def error
    @status = "error"
    render "show"
  end

  def create; end

  def setup_portal(app)
    session = Stripe::BillingPortal::Session.create({
                                                      customer: @app.stripe_customer_id,
                                                      return_url: Chaskiq::Config.get("HOST") + "/apps/#{app.key}/billing"
                                                    })

    session.url
  end

  def setup_intent(app, plan_id)
    customer_data = if @app.stripe_customer_id.present?
                      { customer: @app.stripe_customer_id }
                    else
                      { customer_email: @app.email }
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
      success_url: Chaskiq::Config.get("HOST") + "/apps/#{@app.key}/billing/success?{CHECKOUT_SESSION_ID}",
      cancel_url: Chaskiq::Config.get("HOST")  + "/apps/#{@app.key}/billing/error",
      automatic_tax: { enabled: true }
    }.merge!(customer_data)

    session = Stripe::Checkout::Session.create(stripe_options)
    session.url
  end

  def update_subscription(app, plan_id)
    subscription = @app.stripe_subscription_id
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
end
