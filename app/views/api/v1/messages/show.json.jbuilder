# frozen_string_literal: true

json.message do
  json.created_at @message.created_at
  json.id @message.id
  json.serialized_content @message.serialized_content
  json.user_track_url @user.encoded_id
  json.theme @message.settings['theme']
  # dynamic integration
  json.html_content @message.mustache_template_for(@user) #  @message.html_content
  json.updated_at @message.updated_at
end
