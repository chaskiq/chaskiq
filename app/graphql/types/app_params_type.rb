module Types
  class AppParamsType < Types::BaseInputObject
    argument :domain_url, String, required: true
    argument :name, String, required: true
    argument :tagline, String, required: false
    argument :timezone, String, required: false
    argument :gather_social_data, String, required: false
    argument :outgoing_email_domain, String, required: false
  end
end
