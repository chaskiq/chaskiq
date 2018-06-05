require "browser/aliases"

class Api::V1::AppsController < ActionController::API

  Browser::Base.include(Browser::Aliases)

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

    # resource_params.to_h.merge(request.location.data)
    data = resource_params.to_h.deep_merge(browser_params)
    ap = @app.add_visit(data)
    render json: ap
  end

  def resource_params
    params.require(:user_data).permit! #(:name, :age)
  end
end
