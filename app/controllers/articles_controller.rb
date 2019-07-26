class ArticlesController < ApplicationController

  layout "articles"

  def show
    messenger_data
    render html: "", layout: true, layout: "articles"
  end

  private
  def messenger_data
    article_setting = ArticleSetting.find_by(subdomain: request.subdomain)
    @app = article_setting.app
    key = @app.encryption_key
    @sessionless = params[:sessionless]

    @h = {
      http: Rails.env.production? ? 'https://' : 'http://',
      ws:   Rails.env.production? ? 'wss://' : 'ws://'
    }

    @json_payload = {
      domain: @h[:http] + request.env["HTTP_HOST"],
      ws: @h[:ws] + request.env["HTTP_HOST"]+ "/cable",
      app_id: "#{@app.key}",
    }
    @json_payload = @json_payload.to_json
    @encrypted_data = JWE.encrypt(@json_payload, key, alg: 'dir')
  end

end
