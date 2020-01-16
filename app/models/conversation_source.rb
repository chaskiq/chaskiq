class ConversationSource < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_package_integration

  def deliver_message(opts)
    app_package_integration.send_message(conversation, opts)
  end
end
