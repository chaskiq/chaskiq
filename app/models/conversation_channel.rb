class ConversationChannel < ApplicationRecord
  belongs_to :conversation

  def notify_part(conversation:, part:)
    pkg = conversation.app
                      .app_package_integrations
                      .joins(:app_package)
                      .where("app_packages.name =?", provider_name(provider))
                      .limit(1).first

    # TODO: notify from time to time that this package is not delivering
    # due to there is no installed package,
    # this could happen when channels are available but there is no package added
    return if pkg.blank?

    pkg.message_api_klass.notify_message(
      conversation: conversation,
      part: part,
      channel: provider_channel_id
    )
  end

  private

  def provider_name(provider)
    # a classify version without the singularize
    provider.to_s.sub(/.*\./, "").camelize
  end
end
