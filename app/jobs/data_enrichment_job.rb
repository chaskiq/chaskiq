# frozen_string_literal: true

class DataEnrichmentJob < ApplicationJob
  queue_as :default

  def perform(user_id:)
    user = AppUser.find(user_id)

    tag = ActsAsTaggableOn::Tag.find_by(name: 'enrichment')

    return if tag.blank?

    providers = user.app.app_package_integrations
                    .joins(app_package: :taggings)
                    .where('taggings.tag_id =?', tag.id)

    providers.each do |provider|
      service = "DataEnrichmentService::#{provider.app_package.name}".constantize
      return if provider.api_secret.blank?

      service_instance = service.new(token: provider.api_secret)
      if service_instance.respond_to?(:enrich_user)
        service_instance.enrich_user(user)
      end
    end
  end
end
