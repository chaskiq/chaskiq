class DigitalOcean::Api
  API_BASE_URL = "https://api.digitalocean.com/v2".freeze

  attr_accessor :conn

  def initialize(api_key: nil)
    @api_key = api_key || Chaskiq::Config.get("DO_API_KEY")
    @conn = Faraday.new(url: API_BASE_URL) do |faraday|
      faraday.request :url_encoded
      faraday.adapter Faraday.default_adapter
      faraday.headers["Content-Type"] = "application/json"
      faraday.headers["Authorization"] = "Bearer #{@api_key}"
    end
  end

  def list_database_backups(database_id)
    response = @conn.get "/databases/#{database_id}/backups"

    if response.status == 200
      data = JSON.parse(response.body)
      data["backups"]
    else
      Rails.logger.debug { "Error: #{response.status} - #{response.body}" }
      []
    end
  end

  def list_database_clusters
    response = @conn.get "/databases"

    if response.status == 200
      data = JSON.parse(response.body)
      data["databases"]
    else
      Rails.logger.debug { "Error: #{response.status} - #{response.body}" }
      []
    end
  end

  def get_backup_download_url(backup_id)
    response = @conn.get "/databases/backups/#{backup_id}/actions", { type: "generate-download-url" }

    if response.status == 200
      data = JSON.parse(response.body)
      data["action"]["metadata"]["download_url"]
    else
      Rails.logger.debug { "Error: #{response.status} - #{response.body}" }
      nil
    end
  end
end
