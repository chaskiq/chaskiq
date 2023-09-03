# frozen_string_literal: true

class HomeController < ApplicationController
  layout "hotwire"
  before_action :authenticate_agent!
  def show; end
end
