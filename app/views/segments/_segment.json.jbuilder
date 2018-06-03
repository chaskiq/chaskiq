json.extract! segment, :id, :created_at, :updated_at, :predicates
json.url app_segment_path(@app.key, segment)
