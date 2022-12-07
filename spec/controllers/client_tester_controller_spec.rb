# frozen_string_literal: true

require "rails_helper"

RSpec.describe ClientTesterController, type: :controller do
  before(:each) do
    # @request.host = "http://app.chat.com.br"
  end

  pending "text route" do
    @request.host = "app.chat.com.br"
    get :show
  end
end
