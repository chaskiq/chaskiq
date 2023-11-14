class Apps::EmailForwardingController < ApplicationController
  before_action :find_app
  before_action :set_settings_navigator

  before_action :check_plan

  private

  def check_plan
    allowed_feature?("InboundEmails")
  end
end
