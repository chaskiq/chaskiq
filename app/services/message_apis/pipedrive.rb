# frozen_string_literal: true

module MessageApis
  class Pipedrive
    # https://developers.pipedrive.com/docs/api/v1/
    BASE_URL = 'https://api.pipedrive.com/v1'

    attr_accessor :secret

    def initialize(config:)
      @secret = secret

      @api_token = config["api_secret"]

      @conn = Faraday.new request: {
        params_encoder: Faraday::FlatParamsEncoder
      }
    end

    def url(url)
      "#{BASE_URL}#{url}?api_token=#{@api_token}"
    end

    def trigger(event)
      case event.action
      when 'email_changed' then register_contact(event.eventable)
      end
    end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id, 
        params: params.permit!.to_h
      )
    end

    def process_event(params, package)
      @package = package
      current = params["current"]
      case params["meta"]["action"]
      when "updated" then update_app_user_profile(current)
      when "deleted" then delete_app_user_profile(params)
      end
    end

    def delete_app_user_profile(data)
      id = data["meta"]["id"]
      profile = @package.app.external_profiles.find_by(profile_id: id)
      return if profile.blank?
      profile.destroy
    end

    def update_app_user_profile(data)

      external_profile = @package.app.external_profiles.find_by(
        provider: "pipedrive", 
        profile_id: data["id"]
      )

      return if external_profile.blank?

      app_user = external_profile.app_user

      # we skip users that are not in chaskiq, right ?
      return if app_user.blank?

      first_name = data["first_name"]
      last_name  = data["last_name"]

      name = "#{first_name} #{last_name}"

      update_params = {
        email: data["email"][0]["value"],
        name: name,
        last_name: last_name,
        first_name: first_name,
        phone: data["phone"][0]["value"]
      }.reject{|k,v| v.blank? }

      app_user.update(update_params)

      external_profile.update(data: data)
    end

    def self.tester
      MessageApis::Pipedrive.new(
        secret: @api_token
        #secret: Rails.application.credentials.integrations.dig(:pipedrive, :secret)
      )
    end

    def register_contact(user)
      external_profile = user.external_profiles.find_or_create_by(
        provider: "pipedrive"
      )

      if( external_profile and 
          external_profile.profile_id.present? and
          find_response = person(external_profile.profile_id) and
          find_response["success"].present?
        )

        id = find_response["data"]["id"]
        external_profile.update(
          data: find_response["data"]
        )

      else

        response = create_person(params: {
          email: user.email, 
          name: user.name
        })

        external_profile.update(
          profile_id: response["data"]["id"] ,
          data: response["data"]
        ) if response["success"]

      end
    end

    def find_user(term:, search_by_email: false, start: 0 )
      url = url('/persons/find')
      data = {
        term: term,
        start: start,
        limit: 20
      }

      response = @conn.get(url, data, 
        {'Content-Type'=> 'application/json'})

      JSON.parse(response.body)
    end

    def person(id)
      url = url("/persons/#{id}")
      response = @conn.get(url, {}, {'Content-Type'=> 'application/json'})
      JSON.parse(response.body)
    end

    def create_person(params:)
      url = url('/persons')
      data = {
        #"name": 'jojoijoji michelson m',
        #"email": 'miguejoijolmichelson@gmail.com',
        #"phone": '0992302305',
        #"visible_to": '3'
      }
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = params.to_json
      end

      data = JSON.parse(response.body)
    end

    def update_person(id: , params:)
      url = url("/persons/#{id}")

      data = {  
        "visible_to": '3'
      }.merge!(params)

      response = @conn.put do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = data.to_json
      end

      JSON.parse(response.body)
    end

    def register_webhook(app_package, integration)
      subscription_url = integration.hook_url
      #"#{ENV['HOST']}/api/v1/hooks/#{integration.app.key}/#{app_package.name.underscore}/#{integration.id}"
      data = {
        subscription_url: subscription_url,
        event_action: "*",
        event_object: 'person'
      }
      url = url('/webhooks')
      response = @conn.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = data.to_json
      end
    end

    def get_webhooks
      url = url("/webhooks")
      response = @conn.get(url, nil, {'Content-Type'=> 'application/json'} )
      JSON.parse(response.body)
    end

    def delete_webhook(id)
      url = url("/webhooks/#{id}")
      response = @conn.delete(url, nil, {'Content-Type'=> 'application/json'} )
    end

    def delete_webhooks
      get_webhooks["data"].map{|o| delete_webhook(o["id"])}
    end
  
  end
end
