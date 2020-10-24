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
      service_instance = provider.message_api_klass
      service_instance.enrich_user(user) if service_instance.respond_to?(:enrich_user)
    end
  end
end
