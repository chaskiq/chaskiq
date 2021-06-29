# frozen_string_literal: true

class PageHeader::Component < ApplicationViewComponent
  option :title
  option :breadcrumbs, default: ->{nil}
  option :actions, default: ->{nil}
end
