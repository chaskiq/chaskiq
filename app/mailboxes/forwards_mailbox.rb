class ForwardsMailbox < ApplicationMailbox
  # Callbacks specify prerequisites to processing
  before_processing :require_forward
 
  def process
    puts "oeoeoeo"
    #if forwarder.buckets.one?
    #  record_forward
    #else
    ##  stage_forward_and_request_more_details
    #end
  end
 

  private
    def require_forward
      unless message.forward?
        # Use Action Mailers to bounce incoming emails back to sender – this halts processing
        bounce_with Forwards::BounceMailer.missing_forward(
          inbound_email, forwarder: forwarder
        )
      end
    end
 
    def forwarder
      #TODO: find app user by app id too
      @forwarder ||= AppUser.joins(:user).where("users.email =?", mail.from).first
    end
 
    def record_forward
      forwarder.buckets.first.record \
        Forward.new forwarder: forwarder, subject: message.subject, content: mail.content
    end
 
    def stage_forward_and_request_more_details
      Forwards::RoutingMailer.choose_project(mail).deliver_now
    end

end
