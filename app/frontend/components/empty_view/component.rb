# frozen_string_literal: true

class EmptyView::Component < ApplicationViewComponent
  option :subtitle
  option :title
  option :text
  option :icon, default: ->{ nil }
  option :shadow_less, default: ->{ nil }
  option :classes, default: ->{ nil }
end
