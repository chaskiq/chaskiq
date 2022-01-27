# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_12_24_190304) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "action_mailbox_inbound_emails", force: :cascade do |t|
    t.integer "status", default: 0, null: false
    t.string "message_id", null: false
    t.string "message_checksum", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["message_id", "message_checksum"], name: "index_action_mailbox_inbound_emails_uniqueness", unique: true
  end

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
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
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
    t.string "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer "invitation_limit"
    t.string "invited_by_type"
    t.bigint "invited_by_id"
    t.integer "invitations_count", default: 0
    t.boolean "bot"
    t.boolean "available"
    t.index ["confirmation_token"], name: "index_agents_on_confirmation_token", unique: true
    t.index ["email"], name: "index_agents_on_email", unique: true
    t.index ["invitation_token"], name: "index_agents_on_invitation_token", unique: true
    t.index ["invitations_count"], name: "index_agents_on_invitations_count"
    t.index ["invited_by_id"], name: "index_agents_on_invited_by_id"
    t.index ["invited_by_type", "invited_by_id"], name: "index_agents_on_invited_by_type_and_invited_by_id"
    t.index ["key"], name: "index_agents_on_key"
    t.index ["reset_password_token"], name: "index_agents_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_agents_on_unlock_token", unique: true
  end

  create_table "app_package_integrations", force: :cascade do |t|
    t.bigint "app_package_id", null: false
    t.bigint "app_id", null: false
    t.jsonb "settings"
    t.string "state"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "external_id"
    t.index ["app_id"], name: "index_app_package_integrations_on_app_id"
    t.index ["app_package_id"], name: "index_app_package_integrations_on_app_package_id"
    t.index ["external_id"], name: "index_app_package_integrations_on_external_id"
  end

  create_table "app_packages", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.jsonb "settings"
    t.string "state"
    t.string "url"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "agent_id"
    t.boolean "published", default: false
    t.index ["agent_id"], name: "index_app_packages_on_agent_id"
    t.index ["name"], name: "index_app_packages_on_name", unique: true
  end

  create_table "app_translations", force: :cascade do |t|
    t.bigint "app_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "greetings"
    t.text "intro"
    t.text "tagline"
    t.index ["app_id"], name: "index_app_translations_on_app_id"
    t.index ["locale"], name: "index_app_translations_on_locale"
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
    t.datetime "last_seen"
    t.datetime "first_seen"
    t.datetime "signed_up"
    t.datetime "last_contacted"
    t.datetime "last_heard_from"
    t.index ["app_id"], name: "index_app_users_on_app_id"
    t.index ["email"], name: "index_app_users_on_email"
    t.index ["key"], name: "index_app_users_on_key"
    t.index ["session_id"], name: "index_app_users_on_session_id"
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
    t.integer "owner_id"
    t.index ["key"], name: "index_apps_on_key"
    t.index ["preferences"], name: "index_apps_on_preferences", using: :gin
  end

  create_table "apps_translations", force: :cascade do |t|
  end

  create_table "article_collection_translations", force: :cascade do |t|
    t.bigint "article_collection_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "title"
    t.text "description"
    t.index ["article_collection_id"], name: "index_article_collection_translations_on_article_collection_id"
    t.index ["locale"], name: "index_article_collection_translations_on_locale"
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

  create_table "article_collections_translations", force: :cascade do |t|
  end

  create_table "article_content_translations", force: :cascade do |t|
    t.bigint "article_content_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "serialized_content"
    t.index ["article_content_id"], name: "index_article_content_translations_on_article_content_id"
    t.index ["locale"], name: "index_article_content_translations_on_locale"
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

  create_table "article_contents_translations", force: :cascade do |t|
  end

  create_table "article_setting_translations", force: :cascade do |t|
    t.bigint "article_setting_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "site_title"
    t.text "site_description"
    t.index ["article_setting_id"], name: "index_article_setting_translations_on_article_setting_id"
    t.index ["locale"], name: "index_article_setting_translations_on_locale"
  end

  create_table "article_settings", force: :cascade do |t|
    t.string "domain"
    t.string "subdomain"
    t.jsonb "properties", default: {}
    t.bigint "app_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_article_settings_on_app_id"
    t.index ["subdomain"], name: "index_article_settings_on_subdomain", unique: true
  end

  create_table "article_settings_translations", force: :cascade do |t|
  end

  create_table "article_translations", force: :cascade do |t|
    t.bigint "article_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "title"
    t.text "description"
    t.index ["article_id"], name: "index_article_translations_on_article_id"
    t.index ["locale"], name: "index_article_translations_on_locale"
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

  create_table "articles_translations", force: :cascade do |t|
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

  create_table "audits", force: :cascade do |t|
    t.string "action"
    t.bigint "agent_id", null: false
    t.string "auditable_type", null: false
    t.bigint "auditable_id", null: false
    t.jsonb "data"
    t.string "ip"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "app_id"
    t.index ["agent_id"], name: "index_audits_on_agent_id"
    t.index ["app_id"], name: "index_audits_on_app_id"
    t.index ["auditable_type", "auditable_id"], name: "index_audits_on_auditable"
  end

  create_table "bot_tasks", force: :cascade do |t|
    t.string "title"
    t.string "state"
    t.jsonb "predicates"
    t.bigint "app_id", null: false
    t.jsonb "settings"
    t.json "paths"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "type"
    t.integer "position"
    t.index ["app_id"], name: "index_bot_tasks_on_app_id"
    t.index ["state"], name: "index_bot_tasks_on_state"
    t.index ["type"], name: "index_bot_tasks_on_type"
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
    t.integer "position"
    t.bigint "workflow_id"
    t.index ["app_id"], name: "index_campaigns_on_app_id"
    t.index ["key"], name: "index_campaigns_on_key"
    t.index ["position"], name: "index_campaigns_on_position"
    t.index ["type"], name: "index_campaigns_on_type"
    t.index ["workflow_id"], name: "index_campaigns_on_workflow_id"
  end

  create_table "campaigns_clone", id: false, force: :cascade do |t|
    t.bigint "id"
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
    t.string "type"
    t.jsonb "settings"
    t.datetime "scheduled_to"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "position"
    t.bigint "workflow_id"
  end

  create_table "collection_section_translations", force: :cascade do |t|
    t.bigint "collection_section_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "title"
    t.text "description"
    t.index ["collection_section_id"], name: "index_collection_section_translations_on_collection_section_id"
    t.index ["locale"], name: "index_collection_section_translations_on_locale"
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

  create_table "collection_sections_translations", force: :cascade do |t|
  end

  create_table "conversation_channels", force: :cascade do |t|
    t.string "provider"
    t.string "provider_channel_id"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["conversation_id"], name: "index_conversation_channels_on_conversation_id"
    t.index ["provider"], name: "index_conversation_channels_on_provider"
    t.index ["provider_channel_id"], name: "index_conversation_channels_on_provider_channel_id"
  end

  create_table "conversation_part_blocks", force: :cascade do |t|
    t.jsonb "blocks"
    t.string "state"
    t.jsonb "data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "conversation_part_channel_sources", force: :cascade do |t|
    t.bigint "conversation_part_id", null: false
    t.string "provider"
    t.string "message_source_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["conversation_part_id"], name: "index_conversation_part_channel_sources_on_conversation_part_id"
    t.index ["message_source_id"], name: "index_conversation_part_channel_sources_on_message_source_id"
    t.index ["provider"], name: "index_conversation_part_channel_sources_on_provider"
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

  create_table "conversation_part_events", force: :cascade do |t|
    t.string "action"
    t.jsonb "data"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
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
    t.string "step_id"
    t.string "trigger_id"
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

  create_table "conversation_sources", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.bigint "app_package_integration_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_package_integration_id"], name: "index_conversation_sources_on_app_package_integration_id"
    t.index ["conversation_id"], name: "index_conversation_sources_on_conversation_id"
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
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "first_agent_reply"
    t.datetime "closed_at"
    t.string "subject"
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

  create_table "external_profiles", force: :cascade do |t|
    t.string "provider"
    t.bigint "app_user_id", null: false
    t.jsonb "data"
    t.string "profile_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_user_id"], name: "index_external_profiles_on_app_user_id"
    t.index ["profile_id"], name: "index_external_profiles_on_profile_id"
    t.index ["provider"], name: "index_external_profiles_on_provider"
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
    t.bigint "app_user_id", null: false
    t.index ["app_user_id"], name: "index_metrics_on_app_user_id"
    t.index ["campaign_id"], name: "index_metrics_on_campaign_id"
    t.index ["message_id"], name: "index_metrics_on_message_id"
    t.index ["trackable_type", "trackable_id"], name: "index_metrics_on_trackable_type_and_trackable_id"
  end

  create_table "oauth_access_grants", force: :cascade do |t|
    t.bigint "resource_owner_id", null: false
    t.bigint "application_id"
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.string "scopes", default: "", null: false
    t.index ["application_id"], name: "index_oauth_access_grants_on_application_id"
    t.index ["resource_owner_id"], name: "index_oauth_access_grants_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
  end

  create_table "oauth_access_tokens", force: :cascade do |t|
    t.bigint "resource_owner_id"
    t.bigint "application_id"
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.string "scopes"
    t.string "previous_refresh_token", default: "", null: false
    t.index ["application_id"], name: "index_oauth_access_tokens_on_application_id"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", force: :cascade do |t|
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.string "redirect_uri"
    t.string "scopes", default: "", null: false
    t.boolean "confidential", default: true, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "owner_id"
    t.string "owner_type"
    t.index ["owner_id", "owner_type"], name: "index_oauth_applications_on_owner_id_and_owner_type"
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "outgoing_webhooks", force: :cascade do |t|
    t.string "state"
    t.bigint "app_id", null: false
    t.string "url"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_outgoing_webhooks_on_app_id"
    t.index ["state"], name: "index_outgoing_webhooks_on_state"
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

  create_table "quick_replies", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.bigint "app_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_quick_replies_on_app_id"
  end

  create_table "quick_replies_translations", force: :cascade do |t|
  end

  create_table "quick_reply_translations", force: :cascade do |t|
    t.bigint "quick_reply_id", null: false
    t.string "locale", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "content"
    t.index ["locale"], name: "index_quick_reply_translations_on_locale"
    t.index ["quick_reply_id"], name: "index_quick_reply_translations_on_quick_reply_id"
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

  create_table "taggings", id: :serial, force: :cascade do |t|
    t.integer "tag_id"
    t.string "taggable_type"
    t.integer "taggable_id"
    t.string "tagger_type"
    t.integer "tagger_id"
    t.string "context", limit: 128
    t.datetime "created_at"
    t.index ["context"], name: "index_taggings_on_context"
    t.index ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index ["taggable_id", "taggable_type", "context"], name: "taggings_taggable_context_idx"
    t.index ["taggable_id", "taggable_type", "tagger_id", "context"], name: "taggings_idy"
    t.index ["taggable_id"], name: "index_taggings_on_taggable_id"
    t.index ["taggable_type"], name: "index_taggings_on_taggable_type"
    t.index ["tagger_id", "tagger_type"], name: "index_taggings_on_tagger_id_and_tagger_type"
    t.index ["tagger_id"], name: "index_taggings_on_tagger_id"
  end

  create_table "tags", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "taggings_count", default: 0
    t.index ["name"], name: "index_tags_on_name", unique: true
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

  create_table "workflows", force: :cascade do |t|
    t.string "title"
    t.jsonb "settings"
    t.jsonb "rules"
    t.string "state"
    t.bigint "app_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["app_id"], name: "index_workflows_on_app_id"
    t.index ["state"], name: "index_workflows_on_state"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "app_package_integrations", "app_packages"
  add_foreign_key "app_package_integrations", "apps"
  add_foreign_key "app_packages", "agents"
  add_foreign_key "app_users", "apps"
  add_foreign_key "article_collections", "apps"
  add_foreign_key "article_settings", "apps"
  add_foreign_key "assignment_rules", "apps"
  add_foreign_key "audits", "agents"
  add_foreign_key "audits", "apps"
  add_foreign_key "bot_tasks", "apps"
  add_foreign_key "campaigns", "apps"
  add_foreign_key "campaigns", "workflows"
  add_foreign_key "collection_sections", "article_collections"
  add_foreign_key "conversation_channels", "conversations"
  add_foreign_key "conversation_part_channel_sources", "conversation_parts"
  add_foreign_key "conversation_parts", "app_users"
  add_foreign_key "conversation_parts", "conversations"
  add_foreign_key "conversation_sources", "app_package_integrations"
  add_foreign_key "conversation_sources", "conversations"
  add_foreign_key "conversations", "apps"
  add_foreign_key "external_profiles", "app_users"
  add_foreign_key "metrics", "app_users"
  add_foreign_key "oauth_access_grants", "agents", column: "resource_owner_id"
  add_foreign_key "oauth_access_grants", "oauth_applications", column: "application_id"
  add_foreign_key "oauth_access_tokens", "agents", column: "resource_owner_id"
  add_foreign_key "oauth_access_tokens", "oauth_applications", column: "application_id"
  add_foreign_key "outgoing_webhooks", "apps"
  add_foreign_key "quick_replies", "apps"
  add_foreign_key "roles", "agents"
  add_foreign_key "roles", "apps"
  add_foreign_key "taggings", "tags"
  add_foreign_key "workflows", "apps"
end
