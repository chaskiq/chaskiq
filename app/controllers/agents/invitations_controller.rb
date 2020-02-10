# frozen_string_literal: true

class Agents::InvitationsController < Devise::InvitationsController
  skip_before_action :verify_authenticity_token, only: [:update]

  def update
    super do |resource|
      if request.format == 'json'
        if resource.errors.empty?
          return respond_with_navigational(resource, status: :success) do
            render json: @token
          end
        else
          return respond_with_navigational(resource)
        end
      end
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

    a = Doorkeeper::Application.first
    client = OAuth2::Client.new(a.uid, a.secret, site: a.redirect_uri)

    access_token =  client.password.get_token(
      resource.email, 
      params[:agent][:password]
    )
    @token = access_token

    resource
  end
end
