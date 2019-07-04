class Agents::InvitationsController < Devise::InvitationsController
  def update
    binding.pry
    #if some_condition
    #  redirect_to root_path
    #else
    #  super
    #end
  end


  private

    # this is called when creating invitation
    # should return an instance of resource class
    def invite_resource
      # skip sending emails on invite
      super { |user| user.skip_invitation = true }
    end

    # this is called when accepting invitation
    # should return an instance of resource class
    def accept_resource
      resource = resource_class.accept_invitation!(update_resource_params)
      # Report accepting invitation to analytics
      # Analytics.report('invite.accept', resource.id)
      resource
    end

end
