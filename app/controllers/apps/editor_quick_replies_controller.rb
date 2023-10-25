class Apps::EditorQuickRepliesController < ApplicationController
  before_action :find_app
  def index
    authorize! @app, to: :can_read_quick_replies?, with: AppPolicy
    @quick_replies = @app.quick_replies
  end

  def create
    authorize! @app, to: :can_read_quick_replies?, with: AppPolicy
    q = params[:q]

    @quick_replies = if q.present?
                       @app.quick_replies
                           .ransack(title_cont: q)
                           .result(distinct: true)
                     else
                       @app.quick_replies
                     end
  end
end
