require "browser/aliases"

class Api::V1::AppsController < ApiController

  Browser::Base.include(Browser::Aliases)

  before_action :get_app
  before_action :get_user_data
  before_action :authorize!

  def get_app
    @app = App.find_by(key: params[:id])
  end

  def auth
    render json: @user_data
  end

  def ping
    @app = App.find_by(key: params[:id])

    browser = Browser.new(request.user_agent, accept_language: request.accept_language)
    language = browser.accept_language.first

    browser_params = {
      referrer:         request.referrer,
      ip:               request.remote_ip,
      city:             request.location.city,
      region:           request.location.region,
      country:          request.location.country,
      lat:              request.location.coordinates[1],
      lng:              request.location.coordinates[0],
      postal:           request.location.postal,
      browser:          browser.name,
      browser_version:  browser.version,
      os:               browser.platform.id,
      os_version:       browser.platform.version,
      browser_language: language.try(:code)
    }

    get_user_data

    # resource_params.to_h.merge(request.location.data)
    #data = resource_params.to_h.deep_merge(browser_params)
    data = @user_data.slice(:name, :email, :properties).deep_merge(browser_params)
    ap = @app.add_visit(data)
    render json: {user: ap, app: @app.as_json(only: [], methods: [:active_messenger, :domain_url])}
  end

  def resource_params
    params.require(:user_data).permit! #(:name, :age)
  end

end
