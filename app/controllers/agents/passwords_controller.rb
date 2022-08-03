class Agents::PasswordsController < Devise::PasswordsController
  def after_resetting_password_path_for(resource)
    # remove expirable tokens,
    # the tokens with expires_in: nil are those from app
    # integration packages and we must not remove those
    resource.access_tokens.where.not(expires_in: nil).delete_all
    super(resource)
  end
end
