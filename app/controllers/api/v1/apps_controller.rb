require "browser/aliases"

class Api::V1::AppsController < ApiController

  Browser::Base.include(Browser::Aliases)

  before_action :get_app
  before_action :get_user_data_from_auth, only: :auth
  before_action :get_user_data, except: :auth
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

    get_user_data

    browser_params = {
      page_url:         request.original_url,
      referrer:         request.referrer,
      ip:               request.remote_ip,
      city:             request.location.data["city"],
      region_code:      request.location.data["region_code"],
      region:           request.location.data["region"],
      country:          request.location.data["country_name"],
      country_code:     request.location.data["country_code"],
      lat:              request.location.data["latitude"],
      lng:              request.location.data["longitude"],
      postal:           request.location.data["zipcode"],
      browser:          browser.name,
      browser_version:  browser.version,
      os:               browser.platform.id,
      os_version:       browser.platform.version,
      browser_language: language.try(:code),
      lang:             @user_data[:properties].present? ? @user_data[:properties].fetch(:lang) : nil
    }

    # resource_params.to_h.merge(request.location.data)
    #data = resource_params.to_h.deep_merge(browser_params)
    data = @user_data.slice(:name, :email, :properties).deep_merge(browser_params)
    ap = @app.add_visit(data)
    render json: {
      user: ap, 
      app: @app.as_json(only: [], methods: [
        :active_messenger, 
        :domain_url, 
        :tagline,
        :theme
      ]
    )}
  end

  def resource_params
    params.require(:user_data).permit! #(:name, :age)
  end

end
