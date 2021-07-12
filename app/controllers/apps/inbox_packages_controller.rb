class Apps::InboxPackagesController < ApplicationController
  before_action :find_app
  before_action :find_conversation

  layout false

  def index
    @inbox_packages = @app.inbox_apps ||= []
    render "edit_packages" and return if params[:kind] == "edit"
  end

  def sort
    a = @app.inbox_apps

    a.insert(
      params["section"]["position"],
      a.delete_at(params["section"]["id"].to_i)
    )

    @app.update(inbox_apps: a)

    render turbo_stream: turbo_stream.replace(
      "inbox-sorts",
      partial: "apps/inbox_packages/inbox_sorts"
    )

    # my_index = [1,3,5,7,9,2,4,6,8,10]
    # my_collection = [{"id"=>1}, {"id"=>4}, {"id"=>9}, {"id"=>2}, {"id"=>7}]
    # my_collection.sort_by{|x| my_index.index x['id'] }
    # [{"id"=>1}, {"id"=>7}, {"id"=>9}, {"id"=>2}, {"id"=>4}]
  end

  def destroy
    id = params[:id].to_i

    @app.inbox_apps.delete_at(id)

    @app.save

    render turbo_stream: turbo_stream.replace(
      "inbox-sortable",
      partial: "apps/inbox_packages/inbox_sorts"
    )
  end

  def find_conversation
    # @conversation = @app.conversations.find_by(key: params[:conversation_id])
  end
end
