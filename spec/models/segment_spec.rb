require 'rails_helper'

RSpec.describe Segment, type: :model do
  it{should belong_to :app}
end
