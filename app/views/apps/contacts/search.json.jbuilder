json.collection @collection do |person|
  json.first_name person.name
  json.id person.id
  json.email person.email
  json.display_name person.display_name
end
