# frozen_string_literal: true

json.collection @metrics do |c|
  json.id c.id
  json.action     c.action
  json.host       c.host
  json.data       c.data
  json.created_at c.created_at
  json.email      c.trackable.email
end

json.meta do
  json.current_page(@metrics.current_page)
  json.next_page(@metrics.try(:next_page))
  json.prev_page(@metrics.try(:prev_page))
  json.total_pages(@metrics.total_pages)
  json.total_count(@metrics.total_count)
end
