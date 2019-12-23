# frozen_string_literal: true

class ConversationPartEvent < ApplicationRecord
  has_one :conversation_part, as: :messageable
end
