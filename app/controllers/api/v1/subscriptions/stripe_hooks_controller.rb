class Api::V1::Subscriptions::StripeHooksController < ApplicationController
  def create
    payload = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, ENV["STRIPE_SIGNING_SECRET"]
      )
    rescue JSON::ParserError,
           Stripe::SignatureVerificationError => e
      # Invalid signature
      status 400
      return
    end

    # Handle the event
    case event.type
    when "customer.subscription.deleted", "customer.subscription.updated"
      process_subscription(event.data.object)
    when "payment_intent.succeeded"
      payment_intent = event.data.object
    when "checkout.session.completed"
      event.data.object.client_reference_id
      process_event(event.data.object)
    else
      Rails.logger.debug { "Unhandled event type: #{event.type}" }
    end

    render json: :ok, status: :ok
  end

  private

  def process_subscription(event)
    app = App.where("preferences->>'stripe_subscription_id' = ? ", event.id).limit(1).first

    return if app.blank?

    subscription = Stripe::Subscription.retrieve(event.id)

    app.update({
                 stripe_customer_id: event.customer,
                 stripe_subscription_id: subscription.id,
                 stripe_subscription_plan_id: subscription.plan.id,
                 stripe_subscription_status: subscription.status
               })

    notify_subscription(app, subscription)
  end

  def process_event(event)
    app = App.find_by(key: event.client_reference_id)
    return if app.blank?

    subscription = Stripe::Subscription.retrieve(event.subscription)

    app.update({
                 stripe_customer_id: event.customer,
                 stripe_subscription_id: subscription.id,
                 stripe_subscription_plan_id: subscription.plan.id,
                 stripe_subscription_status: subscription.status
               })
  end

  def notify_subscription(app, subscription)
    EventsChannel.broadcast_to(app.key,
                               {
                                 type: "stripe:subscription",
                                 data: subscription.as_json
                               }.as_json)
  end
end
