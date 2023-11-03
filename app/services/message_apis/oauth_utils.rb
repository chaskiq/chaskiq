module MessageApis
  module OauthUtils
    extend ActiveSupport::Concern

    HEADERS = { "content-type" => "application/json" } # Suggested set? Any?

    def make_post_request(uri_path, request)
      get_api_access if @client.nil? # token timeout?

      response = @client.post(uri_path, request, HEADERS)

      if response.code.to_i >= 300
        Rails.logger.info "POST ERROR occurred with #{uri_path}, request: #{request} "
        Rails.logger.info "Error code: #{response.code} #{response}"
        Rails.logger.info "Error Message: #{response.body}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_get_request(uri_path)
      get_api_access if @client.nil? # token timeout?

      response = @client.get(uri_path, HEADERS)

      if response.code.to_i >= 300
        Rails.logger.info "GET ERROR occurred with #{uri_path}: "
        Rails.logger.info "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_delete_request(uri_path)
      get_api_access if @client.nil? # token timeout?

      response = @client.delete(uri_path, HEADERS)

      if response.code.to_i >= 300
        Rails.logger.info "DELETE ERROR occurred with #{uri_path}: "
        Rails.logger.info "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end

    def make_put_request(uri_path)
      get_api_access if @client.nil? # token timeout?

      response = @client.put(uri_path, "", { "content-type" => "application/json" })

      Rails.logger.info "#{response.message}  - Rate limited..." if response.code.to_i == 429

      if response.code.to_i >= 300
        Rails.logger.info "PUT ERROR occurred with #{uri_path}, " # request: #{request} "
        Rails.logger.info "Error: #{response}"
      end

      if response.body.nil? # Some successful API calls have nil response bodies, but have 2## response codes.
        response.code # Examples include 'set subscription', 'get subscription', and 'delete subscription'
      else
        response.body
      end
    end
  end
end
