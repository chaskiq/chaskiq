module MessageApis
  class BasePackage
    # def initialize(config:); end

    def trigger(event); end

    def process_event(params, package); end

    def enqueue_process_event(params, package)
      HookMessageReceiverJob.perform_now(
        id: package.id,
        params: params.permit!.to_h
      )
    end

    # triggered when a new chaskiq message is created
    # will triggered just after the ws notification
    def notify_message(conversation:, part:, channel:)
      # TODO: ? redis cache here for provider / channel id / part
      provider = self.class::PROVIDER

      return if part
                .conversation_part_channel_sources
                .find_by(provider: provider).present?

      message = part.message.as_json

      response = send_message(conversation, message)

      response_data = JSON.parse(
        response.respond_to?(:body) ? response.body : response
      )

      message_id = get_message_id(response_data)

      return unless message_id.present?

      part.conversation_part_channel_sources.create(
        provider: provider,
        message_source_id: message_id
      )
    end
  end
end
