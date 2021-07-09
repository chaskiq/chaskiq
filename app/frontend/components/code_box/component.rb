# frozen_string_literal: true

class CodeBox::Component < ApplicationViewComponent
  option :code
  option :lang, default: ->{'javascript'}
end
