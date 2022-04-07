module Types
  class CampaignParamsType < Types::BaseInputObject
    argument :from_name, String, required: false
    argument :name, String, required: false
    argument :description, String, required: false
    argument :scheduled_at, String, required: false
    argument :scheduled_to, String, required: false
    argument :subject, String, required: false
    argument :timezone, String, required: false
    argument :serialized_content, String, required: false
    argument :html_content, String, required: false
  end
end
