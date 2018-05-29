require 'rails_helper'

RSpec.describe Conversation, type: :model do
  it{ should have_many :conversation_parts}
  it{ should belong_to :app}
end