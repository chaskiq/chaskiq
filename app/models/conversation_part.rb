class ConversationPart < ApplicationRecord
  belongs_to :conversation
  belongs_to :app_user

  def read!
    self.read_at = Time.now
    self.save
  end
end
