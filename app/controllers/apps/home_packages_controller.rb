class Apps::HomePackagesController < ApplicationController
  before_action :find_app
  before_action :find_resource

  layout false

  def index
    @app_packages = @app.send(@resource_kind) || []
  end

  def sort
    @app.send(@resource_kind).insert(
      params["section"]["position"],
      a.delete_at(params["section"]["id"].to_i)
    )

    @app.update(@resource_kind => a)

    @app_packages = @app.send(@resource_kind) || []

    render turbo_stream: turbo_stream.replace(
      "home-sortable",
      partial: "apps/home_packages/sorts"
    )
  end

  def destroy
    id = params[:id].to_i

    @app.send(@resource_kind).delete_at(id)

    @app.save

    @app_packages = @resources || []

    render turbo_stream: turbo_stream.replace(
      "home-sortable",
      partial: "apps/home_packages/sorts"
    )
  end

  def find_resource
    @category = params[:kind]
    @resource_kind = @category == "visitors" ? :visitor_home_apps : :user_home_apps
    # @resources = @app.send(resource_kind.to_sym)
  end

  #####

  def sort_user_apps
    a = @app.user_home_apps

    a.insert(
      params["section"]["position"],
      a.delete_at(params["section"]["id"].to_i)
    )

    @app.update(user_home_apps: a)

    render turbo_stream: turbo_stream.replace(
      "home-sortable",
      partial: "apps/messenger/forms/app_sortable",
      locals: {
        sortables: @app.user_home_apps
      }
    )
  end

  def sort_visitor_apps
    a = @app.visitor_home_apps

    a.insert(
      params["section"]["position"],
      a.delete_at(params["section"]["id"].to_i)
    )
    # @app.update(visitor_home_apps: a)

    render turbo_stream: turbo_stream.replace(
      "home-sortable",
      partial: "apps/messenger/forms/app_sortable",
      locals: {
        sortables: @app.user_home_apps
      }
    )
  end
end
