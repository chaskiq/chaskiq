# frozen_string_literal: true

json.extract! segment, :id, :name, :created_at, :updated_at, :predicates
json.url app_segment_path(@app.key, segment)
