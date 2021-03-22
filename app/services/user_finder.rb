# frozen_string_literal: true

module UserFinder
  extend ActiveSupport::Concern

  def find_user
    # TODO: , change this when leads can have mail
    if @user_data.blank? || @user_data[:email].blank?
      visitor = get_user_by_session
    else
      @app.app_users.find_by(email: @user_data[:email])
    end
  end
end
