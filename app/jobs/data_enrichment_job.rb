class DataEnrichmentJob < ApplicationJob
  queue_as :default

  def perform(user_id:)
    user = AppUser.find(user_id)
    
    token = ENV['FULLCONTACT_TOKEN']

    fullcontact = DataEnrichmentService::FullContact.new({token: token})

    response = fullcontact.get_data(params: {email: user.email, macromeasures: true})

    # means an error, escape it
    return if response.status.present? && response.status >= 400

    full_name = response.fullName
    user.name = full_name
    user.first_name = full_name.split(" ")[0]
    user.last_name  = full_name.split(" ")[1]
    user.twitter    = response.twitter
    user.facebook   = response.facebook
    user.linkedin   = response.linkedin
    user.organization = response.organization
    user.job_title = response.title

    
    user.save
  end

end
