require 'rails_helper'

RSpec.describe Conversation, type: :model do
  it{ should have_many :messages}
  it{ should belong_to :app}
end