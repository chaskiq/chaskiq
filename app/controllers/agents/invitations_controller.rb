# frozen_string_literal: true

class Agents::InvitationsController < Devise::InvitationsController
  skip_before_action :verify_authenticity_token, only: [:update]

  def update
    super do |resource|
      if request.format == 'json' && resource.errors.empty?
        return respond_with_navigational(resource, status: :success) do
          render json: @token
        end
      end
      respond_with_navigational(resource)
    end
  end

  def edit
    render_empty
    # super
    # super do |resource|
    #  render html: '', :layout => 'application' and return
    # end
  end

  private

  # this is called when creating invitation
  # should return an instance of resource class
  def invite_resource
    # skip sending emails on invite
    super # super { |user| user.skip_invitation = true }
  end

  # this is called when accepting invitation
  # should return an instance of resource class
  def accept_resource
    resource = resource_class.accept_invitation!(update_resource_params)

    access_token = Doorkeeper::AccessToken.create!(
      application_id: nil,
      resource_owner_id: resource.id,
      expires_in: 2.hours,
      scopes: 'public'
    )

    @token = {
      token: access_token.token,
      refresh_token: access_token.refresh_token
    }
    resource
  end
end
