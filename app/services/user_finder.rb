# frozen_string_literal: true

module UserFinder
  extend ActiveSupport::Concern

  def find_user
    # TODO: , change this when leads can have mail
    if @user_data.blank? || @user_data[:email].blank?
      visitor = get_user_by_session
      @app_user = visitor
    else
      @app_user = @app.app_users
                      .where('email =?', @user_data[:email])
                      .first
    end
  end
end
