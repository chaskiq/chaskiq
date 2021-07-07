# frozen_string_literal: true

class Table::Component < ApplicationViewComponent
  option :data
  option :config
  option :paginate
  option :sortable, default: -> {nil}
  option :sortable_group, default: -> {nil}
end
