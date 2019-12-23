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

    a = Warden::JWTAuth::UserEncoder.new.call(resource, :agent, nil)
    resource.update(jti: a.last['jti'])
    @token = { token: "Bearer #{a.first}" }
    # resource.as_json(methods: [:jti, :kind, :display_name])
    resource
  end
end
