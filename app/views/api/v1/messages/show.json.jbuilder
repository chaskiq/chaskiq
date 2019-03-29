
json.message do
  json.created_at @message.created_at 
  json.id @message.id 
  json.serialized_content @message.serialized_content
  # dynamic integration
  json.html_content @message.mustache_template_for(@user) #  @message.html_content
  json.updated_at @message.updated_at 
end