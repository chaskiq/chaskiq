class Api::V1::CredentialsController < ApiController
  before_action :doorkeeper_authorize!
  respond_to    :json

  # GET /me.json
  def show
    respond_with current_resource_owner
  end

  private

  # Find the user that owns the access token
  def current_resource_owner
    Agent.find(doorkeeper_token.resource_owner_id) if doorkeeper_token
  end
end