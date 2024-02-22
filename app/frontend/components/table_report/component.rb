# frozen_string_literal: true

class TableReport::Component < ApplicationViewComponent
  option :data
  option :config
  option :paginate, default: -> {}
  option :paginate_meta, default: -> {}
  option :headless, default: -> {}
  option :sortable, default: -> {}
  option :sortable_group, default: -> {}
end
