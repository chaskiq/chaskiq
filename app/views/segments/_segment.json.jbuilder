json.extract! segment, :id, :created_at, :updated_at
json.url app_segment_url(@app.key, segment, format: :json)
