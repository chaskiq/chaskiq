# frozen_string_literal: true

class ConversationPartBlock::Component < ApplicationViewComponent
  option :message
  option :app
  option :frame, default: -> {}
  option :viewer, default: -> {}
end
