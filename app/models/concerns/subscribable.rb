module Subscribable
  extend ActiveSupport::Concern

  def plan
    if stripe_subscription_status == "active" || stripe_subscription_status == "trialing"
      @plan ||= Plan.new(
        Plan.get_by_id(stripe_subscription_plan_id) || Plan.get("free")
      )
    elsif paddle_subscription_status == "active" || paddle_subscription_status == "trialing"
      @plan ||= Plan.new(
        Plan.get_by_id(paddle_subscription_plan_id.to_i) || Plan.get("free")
      )
    else
      @plan = Plan.new(Plan.get("free"))
    end
  end

  def plan_status
    stripe_subscription_status || paddle_subscription_status
  end

  def payment_service
    if paddle_subscription_plan_id.present?
      PaymentServices::Paddle
    else
      PaymentServices::StripeService
    end
  end

  def payment_attribute(key)
    if PaymentServices::StripeService == payment_service
      send("stripe_#{key}".to_sym)
    elsif PaymentServices::Paddle == payment_service
      send("paddle_#{key}".to_sym)
    end
  end

  def trialing?
    return false if plan_status.present?

    plan.name == "free"
  end

  def canceled?
    return false unless subscriptions_enabled?

    !trialing? && plan_status == "canceled"
  end

  def subscriptions_enabled?
    Chaskiq::Config.get("SUBSCRIPTIONS_ENABLED") == "true"
  end

  def blocked?
    return unless subscriptions_enabled?
    raise Plan::PlanError, { code: "feature", message: "plan not meet on feature" }.to_json if canceled?
  end
end
