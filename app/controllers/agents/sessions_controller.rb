# frozen_string_literal: true

class Agents::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, only: [:destroy]
  skip_before_action :verify_signed_out_user, only: [:destroy]

  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message! :notice, :signed_out if signed_out
    yield if block_given?
    # respond_to_on_destroy
    respond_with_navigational(resource, status: :success) do
      render json: { a: 'ok' }
    end
  end

  private
end
