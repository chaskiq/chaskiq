# frozen_string_literal: true

class HomeController < ApplicationController
  before_action :authenticate_agent!

  def show
    @apps = current_agent.apps.page(params[:page]).per(30)
    render "home/show"
  end
end
