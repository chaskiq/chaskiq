class Agents::CustomAuthorizationsController < Doorkeeper::TokensController
  def create
    headers.merge!(authorize_response.headers)
    
    #agent = Agent.joins(:access_tokens)
    #.where(
    #  "oauth_access_tokens.token =?", 
    #  authorize_response.body["access_token"])
    #.first

    # first application , we should find application with some conditions
    # like application where name: "default" ?
    # oauth_application = Doorkeeper::Application.first #.find_by(uid: params[:client_id])
    # params.merge!(client_secret: oauth_application.secret )

    render json: authorize_response.body,
           status: authorize_response.status

  rescue Errors::DoorkeeperError => e
    handle_token_exception(e)
  end

end