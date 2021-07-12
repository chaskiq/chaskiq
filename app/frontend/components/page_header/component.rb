# frozen_string_literal: true

class PageHeader::Component < ApplicationViewComponent
  option :title
  option :breadcrumbs, default: -> {}
  option :actions, default: -> {}
end
