require 'URLcrypt'

class Api::V1::TracksController < ActionController::API
  before_action :find_app
  before_action :find_campaign

  #http://localhost:3000/chaskiq/campaigns/1/tracks/1/[click|open|bounce|spam].gif
  %w[open bounce spam].each do |action|
    define_method(action) do
      find_subscriber
      @subscriber.send("track_#{action}".to_sym, { host: get_referrer, campaign_id: @campaign.id })
      #return image
      img_path = Chaskiq::Engine.root.join("app/assets/images/chaskiq", "track.gif")
      send_data File.read(img_path, :mode => "rb"), :filename => '1x1.gif', :type => 'image/gif'
      #send_data File.read(view_context.image_url("chaskiq/track.gif"), :mode => "rb"), :filename => '1x1.gif', :type => 'image/gif'
    end
  end

  def click
    find_subscriber
    #TODO: if subscriber has not an open , we will track open too!
    #that's probably due to plain email or image not being displayed
    @subscriber.track_click({ 
      host: request.referer, 
      campaign_id: @campaign.id, 
      data: params[:r] 
    })
    redirect_to params[:r]
  end

  def close
    find_subscriber
    @subscriber.track_close({ 
      host: request.referer, 
      campaign_id: @campaign.id
    })
    head :ok
  end

private

  def collection
    case params[:mode]
    when "campaigns"
      @app.campaigns
    when "user_auto"
      @app.user_auto_messages
    else
      @app.messages
    end
  end
  # Use callbacks to share common setup or constraints between actions.
  def find_campaign
    @campaign = collection.find(params[:message_id])
  end

  def find_app
    @app = App.find_by(key: params[:app_id])
  end

  def find_subscriber
    @subscriber = @campaign.subscribers.joins(:user).find_by(["users.email =?", URLcrypt.decode(params[:id]) ] )
    #(email: URLcrypt.decode(params[:id]))
  end
end
