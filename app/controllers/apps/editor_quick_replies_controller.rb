class Apps::EditorQuickRepliesController < ApplicationController
  before_action :find_app
  def index
    @quick_replies = @app.quick_replies
  end
end
