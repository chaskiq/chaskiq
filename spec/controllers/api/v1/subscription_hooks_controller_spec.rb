require 'rails_helper'

RSpec.describe Api::V1::SubscriptionHooksController, type: :controller do

  let(:payment_succeed) do
    {
      "alert_id"=>"731429497", 
      "alert_name"=>"payment_succeeded", 
      "balance_currency"=>"USD", 
      "balance_earnings"=>"429.78", 
      "balance_fee"=>"939.95", 
      "balance_gross"=>"441.26", 
      "balance_tax"=>"795.99", 
      "checkout_id"=>"4-07f009f41fd29dc-973122c338", 
      "country"=>"DE", 
      "coupon"=>"Coupon 5", 
      "currency"=>"EUR", 
      "customer_name"=>"customer_name", 
      "earnings"=>"771.77", 
      "email"=>"xcormier@example.net", 
      "event_time"=>"2020-08-04 04:27:57", 
      "fee"=>"0.94", 
      "ip"=>"180.208.194.118", 
      "marketing_consent"=>"", 
      "order_id"=>"8", 
      "passthrough"=>"t9zgq8UV0LtW08Ew", 
      "payment_method"=>"paypal", 
      "payment_tax"=>"0.35", 
      "product_id"=>"3", 
      "product_name"=>"Example String", 
      "quantity"=>"83", 
      "receipt_url"=>"https://my.paddle.com/receipt/1/f1c8cb7b9a3ee3b-11904351f4", 
      "sale_gross"=>"553.8", 
      "used_price_override"=>"false", 
      "p_signature"=>"Vj/HjCDXtq7JAx/qvkajYboy0/fM/Bm8Uas2hzgUP04xkpfEMUEPb6re5TolSPZqLks/gCxH2k4cijuZs1/AjyzxnE8FuTRyGLb3O7LHWvy3Tz8e9qLDkTbnotHn2eOcmlE0YAR3vfV7lZWuaF4u4ZaD5v/q1v2rC3+7Utx9A6WJ+h2rIp0ZreSq++asO14o+hJG0rC5Yw5j6fn/0dboc37TWXJF2l/b9HkZxFNg0VwQLzhdl/WP+605c0JakCdv0wSVdWurGfxD2NRGk6DK4MYT4+g4TiH+pxvkoPf7IX0jgmMJPirwOkTIG3QdU3ZE82x8OP9+Xi0UiYMgntHLdJSffdfIZEwaU5o2xZ3ngjGF+VAdrzkT93PgmbkolzrHhnANPREPq9w5LIrWTzcxgQPHw4u87jhUCkk2hzdN93wR7CUjaVAo+8EkzqWkaPwWa1BRBTWqiAQ7YRDz9Dd2fn32rP8Q9+qOtqAlVNUIoriOvJTKgWOomuSkMy3lpifEFZ07/yvSrdCNvhjDazbQ7kAROGvoXmdjksLi0iCaXFArDxy1fI7eeBgABLRm06YNAhn4TFzTU+RIuyPkagQSdXNHse2tObKlsA3ZHg3UM2MUrzm8fpPGD+azFre9AlQK9S5W/SY5K7/exOIJwtYiqdCQ2bDcmrrUenLIHhkCl4c=", 
      "controller"=>"api/v1/subscription_hooks", 
      "action"=>"create"
      }
  end

  let(:subscription_created) do
    {
      "alert_id"=>"1353132286", 
      "alert_name"=>"subscription_created", 
      "cancel_url"=>"https://checkout.paddle.com/subscription/cancel?user=7&subscription=3&hash=3ea6b796eaee16f2f2c18b1b80d00d4c91c33b8c", 
      "checkout_id"=>"2-7b95e43cf2fe84e-3cc7c9b5d8", 
      "currency"=>"EUR", 
      "email"=>"robel.delores@example.org", 
      "event_time"=>"2020-08-04 04:38:48", 
      "linked_subscriptions"=>"1, 4, 8", 
      "marketing_consent"=>"", "next_bill_date"=>"2020-08-22", 
      "passthrough"=> app.key, 
      "quantity"=>"89",
      "source"=>"Order", 
      "status"=>"trialing", 
      "subscription_id"=>"2", 
      "subscription_plan_id"=>"1", 
      "unit_price"=>"unit_price",
      "update_url"=>"https://checkout.paddle.com/subscription/update?user=9&subscription=2&hash=7ac12518916ef98108ae80c35bd1f220934ee5f8", 
      "user_id"=>"5", 
      "p_signature"=>"XSWc3+u",  
      "controller"=>"api/v1/subscription_hooks", 
      "action"=>"create"
    }
  end

  let(:subscription_updated) do
    {
      "alert_id"=>"695606380", 
      "alert_name"=>"subscription_updated", 
      "cancel_url"=>"https://checkout.paddle.com/subscription/cancel?user=2&subscription=9&hash=ba9a20a7646def7924744d4d18cfc5222ea3fa10", 
      "checkout_id"=>"9-c6d025bca025cf9-41a52af0b3", 
      "currency"=>"GBP", 
      "email"=>"bsawayn@example.com", 
      "event_time"=>"2020-08-04 04:41:07", 
      "linked_subscriptions"=>"6, 6, 6", 
      "marketing_consent"=>"1", 
      "new_price"=>"new_price", 
      "new_quantity"=>"new_quantity", 
      "new_unit_price"=>"new_unit_price", 
      "next_bill_date"=>"2020-08-22", 
      "old_next_bill_date"=>"old_next_bill_date", 
      "old_price"=>"old_price", 
      "old_quantity"=>"old_quantity", 
      "old_status"=>"old_status", 
      "old_subscription_plan_id"=>"old_subscription_plan_id", 
      "old_unit_price"=>"old_unit_price", 
      "passthrough"=> app.key, 
      "status"=>"active", "subscription_id"=>"2", "subscription_plan_id"=>"7", 
      "update_url"=>"https://checkout.paddle.com/subscription/update?user=5&subscription=4&hash=d8e75562bca4d10320c5e9b38509f36904657f2a", 
      "user_id"=>"3", 
      "p_signature"=>"9cJn+j+X8=", 
      "controller"=>"api/v1/subscription_hooks", 
      "action"=>"create"
    }
  end

  let(:subscription_cancelled) do
    {
      "alert_id"=>"1762067817", 
      "alert_name"=>"subscription_cancelled", 
      "cancellation_effective_date"=>"2020-08-24 09:58:27", 
      "checkout_id"=>"6-0989a3805e0f5b4-c4d9aff50b", 
      "currency"=>"USD", 
      "email"=>"zstark@example.org", 
      "event_time"=>"2020-08-04 04:42:50", 
      "linked_subscriptions"=>"5, 3, 4", 
      "marketing_consent"=>"", 
      "passthrough"=> app.key, 
      "quantity"=>"44", 
      "status"=>"deleted", 
      "subscription_id"=>"2", 
      "subscription_plan_id"=>"4", 
      "unit_price"=>"unit_price", 
      "user_id"=>"3", 
      "p_signature"=>"76M=", 
      "controller"=>"api/v1/subscription_hooks", 
      "action"=>"create"
    }
  end

  let!(:app) do
    FactoryBot.create(:app)
  end

  let!(:agent_role) do
    app.add_agent(email: 'test2@test.cl')
  end

  before :each do
    expect_any_instance_of(Api::V1::SubscriptionHooksController).to receive(:verify_key).and_return(true)
  end

  it "create subscription" do
    expect(EventsChannel).to receive(:broadcast_to).with(app.key, any_args).once
    post(:create, params: subscription_created)
    app.reload
    expect(app.paddle_user_id).to be_present
    expect(app.paddle_subscription_id).to be_present
    expect(app.paddle_subscription_plan_id).to be_present

    expect(app.paddle_subscription_status).to be === "trialing"
  end

  it "cancel subscription" do
    expect(EventsChannel).to receive(:broadcast_to).with(app.key, any_args).once
    post(:create, params: subscription_cancelled)
    app.reload
    expect(app.paddle_user_id).to be_present
    expect(app.paddle_subscription_id).to be_present
    expect(app.paddle_subscription_plan_id).to be_present

    expect(app.paddle_subscription_status).to be === "deleted"
  end

  it "update subscription" do
    expect(EventsChannel).to receive(:broadcast_to).with(app.key, any_args).once
    post(:create, params: subscription_updated)
    app.reload
    expect(app.paddle_user_id).to be_present
    expect(app.paddle_subscription_id).to be_present
    expect(app.paddle_subscription_plan_id).to be_present

    expect(app.paddle_subscription_status).to be === "active"
  end
end
