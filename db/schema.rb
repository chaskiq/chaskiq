# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2018_05_31_050057) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "app_users", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "app_id"
    t.jsonb "properties", default: {}
    t.datetime "last_visited_at"
    t.string "referrer"
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_app_users_on_app_id"
    t.index ["user_id"], name: "index_app_users_on_user_id"
  end

  create_table "apps", force: :cascade do |t|
    t.string "key"
    t.string "name"
    t.string "token"
    t.string "state"
    t.string "timezone"
    t.string "test_key"
    t.jsonb "preferences", default: "{}", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["preferences"], name: "index_apps_on_preferences", using: :gin
  end

  create_table "conversation_parts", force: :cascade do |t|
    t.text "message"
    t.datetime "read_at"
    t.bigint "user_id"
    t.bigint "conversation_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_conversation_parts_on_conversation_id"
    t.index ["user_id"], name: "index_conversation_parts_on_user_id"
  end

  create_table "conversations", force: :cascade do |t|
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
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_conversations_on_app_id"
    t.index ["assignee_id"], name: "index_conversations_on_assignee_id"
    t.index ["main_participant_id"], name: "index_conversations_on_main_participant_id"
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

  create_table "segments", force: :cascade do |t|
    t.bigint "app_id"
    t.jsonb "properties", default: "{}", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["app_id"], name: "index_segments_on_app_id"
  end

  create_table "users", force: :cascade do |t|
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "app_users", "apps"
  add_foreign_key "app_users", "users"
  add_foreign_key "conversation_parts", "conversations"
  add_foreign_key "conversation_parts", "users"
  add_foreign_key "conversations", "apps"
end
