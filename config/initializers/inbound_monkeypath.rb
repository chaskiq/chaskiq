=begin
ActionMailbox::Ingresses::Amazon::InboundEmailsController.class_eval do

  private
    def authenticate
      binding.pry
      # get amazon message type and topic
      amz_message_type = request.headers['x-amz-sns-message-type']
      amz_sns_topic = request.headers['x-amz-sns-topic-arn']

      request_body = JSON.parse request.body.read
      # if this is the first time confirmation of subscription, then confirm it
      if amz_message_type.to_s.downcase == 'subscriptionconfirmation' #and amz_sns_topic.to_s.downcase == 'arn:aws:sns:us-west-2:xxxxx:myapp'
        #send_subscription_confirmation request_body
        open(request_body["SubscribeURL"])
        render plain: "ok" and return
      end

      head :unauthorized unless verifier.authentic?(request_body)
    end

end
=end