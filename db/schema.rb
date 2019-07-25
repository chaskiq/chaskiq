# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_07_23_035210) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "agents", force: :cascade do |t|
    t.string "key"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.jsonb "properties", default: {}, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "jti"
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.bigint "invited_by_id"
    t.integer "invitations_count", default: 0
    t.index ["confirmation_token"], name: "index_agents_on_confirmation_token", unique: true
    t.index ["email"], name: "index_agents_on_email", unique: true
    t.index ["invitation_token"], name: "index_agents_on_invitation_token", unique: true
    t.index ["invitations_count"], name: "index_agents_on_invitations_count"
    t.index ["invited_by_id"], name: "index_agents_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_agents_on_invited_by_type_and_invited_by_id"
    t.index ["jti"], name: "index_agents_on_jti", unique: true
    t.index ["key"], name: "index_agents_on_key"
    t.index ["reset_password_token"], name: "index_agents_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_agents_on_unlock_token", unique: true
  end

  create_table "app_users", force: :cascade do |t|
    t.string "key"
    t.bigint "app_id"
    t.jsonb "properties", default: {}
    t.datetime "last_visited_at"
    t.string "referrer"
    t.string "state"
    t.string "ip"
    t.string "city"
    t.string "region"
    t.string "country"
    t.string "subscription_state"
    t.string "session_id"
    t.string "email"
    t.decimal "lat", precision: 15, scale: 10
    t.decimal "lng", precision: 15, scale: 10
    t.string "postal"
    t.integer "web_sessions"
    t.string "timezone"
    t.string "browser"
    t.string "browser_version"
    t.string "os"
    t.string "os_version"
    t.string "browser_language"
    t.string "lang"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "type"
    t.index ["app_id"], name: "index_app_users_on_app_id"
    t.index ["key"], name: "index_app_users_on_key"
    t.index ["type"], name: "index_app_users_on_type"
  end

  create_table "apps", force: :cascade do |t|
    t.string "key"
    t.string "name"
    t.string "token"
    t.string "state"
    t.string "timezone"
    t.string "test_key"
    t.string "encryption_key", limit: 16
    t.jsonb "preferences", default: "{}", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_apps_on_key"
    t.index ["preferences"], name: "index_apps_on_preferences", using: :gin
  end

  create_table "article_collections", force: :cascade do |t|
    t.string "title"
    t.jsonb "properties"
    t.string "slug"
    t.string "state"
    t.text "description"
    t.integer "position"
    t.bigint "app_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_article_collections_on_app_id"
  end

  create_table "article_contents", force: :cascade do |t|
    t.text "html_content"
    t.text "serialized_content"
    t.text "text_content"
    t.bigint "article_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["article_id"], name: "index_article_contents_on_article_id"
  end

  create_table "article_settings", force: :cascade do |t|
    t.jsonb "properties", default: {}
    t.bigint "app_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_article_settings_on_app_id"
  end

  create_table "articles", force: :cascade do |t|
    t.string "title"
    t.string "state"
    t.string "slug"
    t.string "published_at"
    t.integer "position"
    t.bigint "app_id", null: false
    t.bigint "author_id", null: false
    t.bigint "article_collection_id"
    t.bigint "article_section_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_articles_on_app_id"
    t.index ["article_collection_id"], name: "index_articles_on_article_collection_id"
    t.index ["article_section_id"], name: "index_articles_on_article_section_id"
    t.index ["author_id"], name: "index_articles_on_author_id"
    t.index ["slug"], name: "index_articles_on_slug"
  end

  create_table "assignment_rules", force: :cascade do |t|
    t.bigint "app_id", null: false
    t.bigint "agent_id", null: false
    t.jsonb "conditions"
    t.integer "priority"
    t.string "state"
    t.string "title"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["agent_id"], name: "index_assignment_rules_on_agent_id"
    t.index ["app_id"], name: "index_assignment_rules_on_app_id"
  end

  create_table "campaigns", force: :cascade do |t|
    t.string "key"
    t.string "from_name"
    t.string "from_email"
    t.string "reply_email"
    t.text "html_content"
    t.text "premailer"
    t.text "serialized_content"
    t.string "description"
    t.boolean "sent"
    t.string "name"
    t.datetime "scheduled_at"
    t.string "timezone"
    t.string "state"
    t.string "subject"
    t.bigint "app_id"
    t.jsonb "segments"
    t.string "type", default: "Campaign"
    t.jsonb "settings", default: {}
    t.datetime "scheduled_to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_campaigns_on_app_id"
    t.index ["key"], name: "index_campaigns_on_key"
    t.index ["type"], name: "index_campaigns_on_type"
  end

  create_table "collection_sections", force: :cascade do |t|
    t.string "title"
    t.string "slug"
    t.string "state"
    t.integer "position"
    t.bigint "article_collection_id", null: false
    t.text "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["article_collection_id"], name: "index_collection_sections_on_article_collection_id"
  end

  create_table "conversation_part_contents", force: :cascade do |t|
    t.bigint "conversation_part_id"
    t.text "html_content"
    t.text "serialized_content"
    t.text "text_content"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["conversation_part_id"], name: "index_conversation_part_contents_on_conversation_part_id"
  end

  create_table "conversation_parts", force: :cascade do |t|
    t.string "key"
    t.text "message"
    t.datetime "read_at"
    t.bigint "app_user_id"
    t.bigint "conversation_id"
    t.boolean "private_note"
    t.boolean "boolean"
    t.string "authorable_type"
    t.bigint "authorable_id"
    t.string "messageable_type"
    t.bigint "messageable_id"
    t.string "source"
    t.string "string"
    t.string "message_id"
    t.string "email_message_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_user_id"], name: "index_conversation_parts_on_app_user_id"
    t.index ["authorable_type", "authorable_id"], name: "index_conversation_parts_on_authorable_type_and_authorable_id"
    t.index ["boolean"], name: "index_conversation_parts_on_boolean"
    t.index ["conversation_id"], name: "index_conversation_parts_on_conversation_id"
    t.index ["key"], name: "index_conversation_parts_on_key"
    t.index ["message_id"], name: "index_conversation_parts_on_message_id"
    t.index ["messageable_type", "messageable_id"], name: "index_conversation_parts_on_messageable_type_and_messageable_id"
    t.index ["private_note"], name: "index_conversation_parts_on_private_note"
    t.index ["source"], name: "index_conversation_parts_on_source"
    t.index ["string"], name: "index_conversation_parts_on_string"
  end

  create_table "conversations", force: :cascade do |t|
    t.string "key"
    t.bigint "app_id"
    t.bigint "assignee_id"
    t.jsonb "admins"
    t.integer "reply_count"
    t.integer "parts_count"
    t.datetime "latest_admin_visible_comment_at"
    t.datetime "latest_update_at"
    t.datetime "latest_user_visible_comment_at"
    t.datetime "read_at"
    t.bigint "main_participant_id"
    t.boolean "priority"
    t.string "email_message_id"
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_conversations_on_app_id"
    t.index ["assignee_id"], name: "index_conversations_on_assignee_id"
    t.index ["key"], name: "index_conversations_on_key"
    t.index ["main_participant_id"], name: "index_conversations_on_main_participant_id"
    t.index ["priority"], name: "index_conversations_on_priority"
  end

  create_table "events", force: :cascade do |t|
    t.string "eventable_type", null: false
    t.bigint "eventable_id", null: false
    t.string "action"
    t.jsonb "properties"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["action"], name: "index_events_on_action"
    t.index ["eventable_type", "eventable_id"], name: "index_events_on_eventable_type_and_eventable_id"
  end

  create_table "gutentag_taggings", id: :serial, force: :cascade do |t|
    t.integer "tag_id", null: false
    t.integer "taggable_id", null: false
    t.string "taggable_type", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id"], name: "index_gutentag_taggings_on_tag_id"
    t.index ["taggable_type", "taggable_id", "tag_id"], name: "unique_taggings", unique: true
    t.index ["taggable_type", "taggable_id"], name: "index_gutentag_taggings_on_taggable_type_and_taggable_id"
  end

  create_table "gutentag_tags", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "taggings_count", default: 0, null: false
    t.index ["name"], name: "index_gutentag_tags_on_name", unique: true
    t.index ["taggings_count"], name: "index_gutentag_tags_on_taggings_count"
  end

  create_table "jwt_blacklist", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_blacklist_on_jti"
  end

  create_table "metrics", force: :cascade do |t|
    t.bigint "campaign_id"
    t.string "trackable_type", null: false
    t.bigint "trackable_id", null: false
    t.string "action"
    t.string "host"
    t.jsonb "data", default: {}
    t.string "message_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id"], name: "index_metrics_on_campaign_id"
    t.index ["message_id"], name: "index_metrics_on_message_id"
    t.index ["trackable_type", "trackable_id"], name: "index_metrics_on_trackable_type_and_trackable_id"
  end

  create_table "preview_cards", force: :cascade do |t|
    t.integer "status_id"
    t.string "url", default: "", null: false
    t.string "title"
    t.text "description"
    t.string "image"
    t.integer "image_file_size"
    t.string "image_file_name"
    t.string "image_file_type"
    t.datetime "image_updated_at"
    t.string "type"
    t.text "html"
    t.string "author_name"
    t.string "author_url"
    t.string "provider_name"
    t.string "provider_url"
    t.integer "width"
    t.integer "height"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status_id"], name: "index_preview_cards_on_status_id", unique: true
  end

  create_table "roles", force: :cascade do |t|
    t.bigint "app_id"
    t.bigint "agent_id"
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agent_id"], name: "index_roles_on_agent_id"
    t.index ["app_id"], name: "index_roles_on_app_id"
  end

  create_table "segments", force: :cascade do |t|
    t.string "key"
    t.bigint "app_id"
    t.string "name"
    t.jsonb "properties", default: "{}"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_segments_on_app_id"
    t.index ["key"], name: "index_segments_on_key"
  end

  create_table "visits", force: :cascade do |t|
    t.string "url"
    t.bigint "app_user_id", null: false
    t.string "title"
    t.string "browser_version"
    t.string "browser_name"
    t.string "os"
    t.string "os_version"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_user_id"], name: "index_visits_on_app_user_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "app_users", "apps"
  add_foreign_key "article_collections", "apps"
  add_foreign_key "article_settings", "apps"
  add_foreign_key "assignment_rules", "apps"
  add_foreign_key "campaigns", "apps"
  add_foreign_key "collection_sections", "article_collections"
  add_foreign_key "conversation_parts", "app_users"
  add_foreign_key "conversation_parts", "conversations"
  add_foreign_key "conversations", "apps"
  add_foreign_key "roles", "agents"
  add_foreign_key "roles", "apps"
end
