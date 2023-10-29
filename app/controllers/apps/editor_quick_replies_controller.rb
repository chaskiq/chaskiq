class Apps::EditorQuickRepliesController < ApplicationController
  before_action :find_app
  def index
    authorize! @app, to: :can_read_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    @quick_replies = @app.quick_replies

    render "index", layout: false
  end

  def create
    authorize! @app, to: :can_read_quick_replies?, with: AppPolicy, context: {
      user: current_agent
    }

    q = params[:q]

    @quick_replies = if q.present?
                       @app.quick_replies
                           .ransack(title_cont: q)
                           .result(distinct: true)
                     else
                       @app.quick_replies
                     end
  end

  def update
    flash.now[:notice] = "quick reply sent"
  end

  def show
    @locale = params[:lang] || I18n.default_locale
    @quick_reply = @app.quick_replies.find(params[:id])
    render "show", layout: false
  end
end
