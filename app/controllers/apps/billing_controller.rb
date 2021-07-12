class Apps::BillingController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  def transactions
    @transactions = begin
      PaymentServices::Paddle.new.get_subscription_transactions(
        @app.paddle_subscription_id
      )
    rescue StandardError
      []
    end
  end
end
