# frozen_string_literal: true

module ApplicationHelper
  ActionView::Base.default_form_builder = TailwindFormBuilder

  def flash_messages(_opts = {})
    flash.each do |msg_type, message|
      flash.delete(msg_type)
      concat(tag.div(message, class: "alert #{bootstrap_class_for(msg_type)}") do
        concat tag.button("<i class='fa fa-times-circle'></i>".html_safe, class: "close", data: { dismiss: "alert" })
        concat message
      end)
    end

    session.delete(:flash)
    nil
  end

  def support_app_data
    app_key = Chaskiq::Config.get("SUPPORT_APP_KEY")
    return if app_key.blank?

    support_app = App.find_by(key: app_key)
    return if support_app.blank?

    key = support_app.encryption_key
    json_payload = {}

    if current_agent.present?
      user_options = {
        email: current_agent.email,
        identifier_key: OpenSSL::HMAC.hexdigest("sha256", key, current_agent.email),
        properties: {
          name: current_agent.display_name
        }
      }
      json_payload.merge!(user_options)
    end

    # encrypted_data = JWE.encrypt(json_payload.to_json, key, alg: 'dir')
    # { enc: encrypted_data, app: support_app }
    { enc: json_payload.to_json, app: support_app }
  end

  def billing_menu_data(app:)
    [
      {
        label: I18n.t("subscriptions.tabs")[0],
        active: controller.controller_name == "billing" && controller.action_name == "index",
        href: app_billing_index_path(app.key)
      },
      {
        label: I18n.t("subscriptions.tabs")[1],
        active: controller.controller_name == "billing" && controller.action_name == "transactions",
        href: transactions_app_billing_index_path(app.key)
      }
    ]
  end

  def oauth_apps_menu_data(app:)
    [
      {
        label: I18n.t("settings.api.tabs.apps"),
        active: controller.controller_name == "oauth_applications" && controller.action_name == "index",
        href: app_oauth_applications_path(app.key)
      },
      {
        label: I18n.t("settings.api.tabs.authorized"),
        active: controller.controller_name == "team",
        href: app_oauth_applications_path(app.key, authorized: true)
      }
    ]
  end

  def team_menu_data(app:)
    [{
      href: app_team_index_path(app.key),
      label: I18n.t("settings.team.title"),
      active: controller.controller_name == "team"
    },
     {
       href: app_invitations_path(app.key),
       label: I18n.t("settings.team.invitations"),
       active: controller.controller_name == "invitations"
     }]
  end

  def settings_menu_data(app:)
    [
      {
        label: I18n.t("settings.app.app_settings"),
        href: app_settings_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "settings"
      },
      {
        label: I18n.t("settings.app.security"),
        href: app_security_index_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "security"
      },
      {
        label: I18n.t("settings.app.user_data"),
        href: app_user_data_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "user_data"
      },
      {
        label: I18n.t("settings.app.tags"),
        href: app_tags_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "tags"
      },
      {
        label: I18n.t("settings.app.quick_replies"),
        href: app_quick_replies_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "quick_replies"
      },
      {
        label: I18n.t("settings.app.contact_avatars"),
        href: app_contact_avatars_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "avatar"
      },
      {
        label: I18n.t("settings.app.email_forwarding"),
        href: app_email_forwarding_index_path(app.key),
        turbo_frame: "_top",
        active: controller.controller_name == "email_forwarding"
      }
    ]
  end

  def webhooks_menu_data(app:)
    [{
      label: I18n.t("settings.webhooks.active_webhooks"),
      href: app_webhooks_path(app.key),
      active: (controller.controller_name == "webhooks" && params[:kind].blank?) || params[:kind] != "disabled"
    },
     {
       label: I18n.t("settings.webhooks.disabled_webhooks"),
       href: app_webhooks_path(app.key, kind: :disabled),
       active: controller.controller_name == "webhooks" && params[:kind] == "disabled"
     }]
  end

  def integrations_menu_data(app:)
    [{
      label: I18n.t("settings.integrations.active.title"),
      href: app_integrations_path(app.key),
      active: controller.controller_name == "integrations" && !params[:kind]
    },
     {
       label: I18n.t("settings.integrations.available.title"),
       href: app_integrations_path(app.key, kind: :available),
       active: controller.controller_name == "integrations" && params[:kind] == "available"
     },
     {
       label: I18n.t("settings.integrations.yours.title"),
       href: app_integrations_path(app.key, kind: :yours),
       active: (controller.controller_name == "integrations" && params[:kind] == "yours") || (controller.controller_name == "packages")
     }]
  end

  def messenger_menu_data(app:)
    [{
      label: I18n.t("settings.app.appearance"),
      href: app_messenger_index_path(app.key),
      turbo_frame: "_top",
      active: controller.controller_name == "messenger" && controller.action_name == "index"
    },
     {
       label: I18n.t("settings.app.translations"),
       href: edit_app_messenger_path(app.key, :translations),
       turbo_frame: "_top",
       active: params[:id] == "translations"
     },
     {
       label: I18n.t("settings.app.privacy"),
       href: edit_app_messenger_path(app.key, :privacy),
       turbo_frame: "_top",
       active: params[:id] == "privacy"
     },
     {
       label: "Apps",
       href: edit_app_messenger_path(app.key, :apps),
       turbo_frame: "_top",
       active: params[:id] == "apps"
     },
     {
       label: I18n.t("settings.app.availability"),
       href: edit_app_messenger_path(app.key, :availability),
       turbo_frame: "_top",
       active: params[:id] == "availability"
     },
     {
       label: I18n.t("settings.app.email_requirement"),
       href: edit_app_messenger_path(app.key, :email_requirement),
       turbo_frame: "_top",
       active: params[:id] == "email_requirement"
     },
     {
       label: I18n.t("settings.app.inbound_settings"),
       href: edit_app_messenger_path(app.key, :inbound_settings),
       turbo_frame: "_top",
       active: params[:id] == "inbound_settings"
     },
     {
       label: I18n.t("settings.app.messenger_style"),
       href: edit_app_messenger_path(app.key, :style_settings),
       turbo_frame: "_top",
       active: params[:id] == "style_settings"
     }]
  end

  def articles_menu_data(app:)
    [{
      label: t("articles.all"),
      href: app_articles_path(app.key),
      active: params[:kind].blank?
    },
     {
       label: t("articles.published"),
       href: app_articles_path(app.key, kind: :published),
       active: params[:kind] == "published"
     },
     {
       label: t("articles.draft"),
       href: app_articles_path(app.key, kind: :draft),
       active: params[:kind] == "draft"
     }]
  end

  def contact_menu_data(app:, app_user:)
    [{
      label: t("Profile"),
      href: app_contact_path(app.key, app_user),
      active: params[:namespace].blank?,
      turbo_frame: "profile-frame"
    },
     {
       label: t("Conversations"),
       href: app_contact_path(app.key, app_user, namespace: :conversations),
       active: params[:namespace] == "conversations",
       turbo_frame: "profile-frame"
     },
     {
       label: t("Visits"),
       href: app_contact_path(app.key, app_user, namespace: :visits),
       active: params[:namespace] == "visits",
       turbo_frame: "profile-frame"
     }]
  end

  def bots_menu_data(app:)
    [{
      label: t("task_bots.settings.leads.tab"),
      href: leads_app_bots_path(app.key),
      active: (controller.action_name == "leads"),
      turbo_frame: "_top"
    },
     {
       label: t("task_bots.settings.users.tab"),
       href: users_app_bots_path(app.key),
       active: controller.action_name == "users",
       turbo_frame: "_top"
     }]
  end

  def bot_menu_data(app:, bot:)
    [
      {
        label: t("campaigns.tabs.stats"),
        href: edit_app_bot_path(app.key, bot, tab: "stats"),
        active: false,
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.settings"),
        href: edit_app_bot_path(app.key, bot, tab: "settings"),
        active: params[:tab] == "stats" || params[:tab].blank?,
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.audience"),
        href: edit_app_bot_path(app.key, bot, tab: "audience"),
        active: params[:tab] == "audience",
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.editor"),
        href: edit_app_bot_path(app.key, bot, tab: "editor"),
        active: params[:tab] == "editor",
        turbo_frame: "_top"
      }
    ]
  end

  def campaigns_menu_data(app:, campaign:)
    [
      {
        label: t("campaigns.tabs.stats"),
        href: edit_app_campaign_path(app.key, campaign, tab: "stats"),
        active: false,
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.settings"),
        href: edit_app_campaign_path(app.key, campaign, tab: "settings"),
        active: false,
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.audience"),
        href: edit_app_campaign_path(app.key, campaign, tab: "audience"),
        active: false,
        turbo_frame: "_top"
      },
      {
        label: t("campaigns.tabs.editor"),
        href: edit_app_campaign_path(app.key, campaign, tab: "editor"),
        active: false,
        turbo_frame: "_top"
      }
    ]
  end

  def articles_settings_menu_data(app:)
    [{
      label: I18n.t("articles.settings.basic"),
      href: app_articles_setting_path(app.key, :basic),
      active: (params[:id].blank? or params[:id] == "basic")
    },
     {
       label: I18n.t("articles.settings.lang"),
       href: app_articles_setting_path(app.key, :translations),
       active: params[:id] == "translations"
     },
     {
       label: I18n.t("articles.settings.appearance"),
       href: app_articles_setting_path(app.key, :appearance),
       active: params[:id] == "appearance"
     }]
  end

  def articles_collections_menu_data(app:, article_setting:)
    locale_param = params[:locale] || I18n.locale.to_s
    return [] if article_setting.blank?

    article_setting.translations.map(&:locale).map do |locale|
      {
        label: langs_options.find { |o| o[:value] == locale.to_s }.try(:[], :label),
        href: app_articles_collections_path(app.key, locale: locale),
        active: locale_param == locale.to_s
      }
    end
  end

  def articles_collection_menu_data(app:, article_setting:, article_collection:)
    locale_param = params[:locale] || I18n.locale.to_s
    return [] if article_setting.blank?

    article_setting.translations.map(&:locale).map do |locale|
      {
        label: langs_options.find { |o| o[:value] == locale.to_s }.try(:[], :label),
        href: app_articles_collection_path(app.key, article_collection, locale: locale),
        active: locale_param == locale.to_s
      }
    end
  end

  def quick_replies_menu_data(app:, quick_reply:)
    locale_param = params[:locale] || I18n.locale.to_s
    return [] if quick_reply.new_record?
    return [] if app.translations.blank?

    app.translations.map(&:locale).map do |locale|
      {
        label: langs_options.find { |o| o[:value] == locale.to_s }.try(:[], :label),
        href: app_quick_reply_path(app.key, quick_reply, locale: locale),
        active: locale_param == locale.to_s
        # turbo_frame: 'quick_reply_editor'
      }
    end
  end

  def langs_options
    [
      { label: "Afrikaans", value: "af" },
      { label: "Albanian", value: "sq" },
      { label: "Arabic", value: "ar" },
      { label: "Basque", value: "eu" },
      { label: "Bulgarian", value: "bg" },
      { label: "Byelorussian", value: "be" },
      { label: "Catalan", value: "ca" },
      { label: "Croatian", value: "hr" },
      { label: "Czech", value: "cs" },
      { label: "Danish", value: "da" },
      { label: "Dutch", value: "nl" },
      { label: "English", value: "en" },
      { label: "Esperanto", value: "eo" },
      { label: "Estonian", value: "et" },
      { label: "Faroese", value: "fo" },
      { label: "Finnish", value: "fi" },
      { label: "French", value: "fr" },
      { label: "Galician", value: "gl" },
      { label: "German", value: "de" },
      { label: "Greek", value: "el" },
      { label: "Hebrew", value: "iw" },
      { label: "Hungarian", value: "hu" },
      { label: "Icelandic", value: "is" },
      { label: "Irish", value: "ga" },
      { label: "Italian", value: "it" },
      { label: "Japanese", value: "ja" },
      { label: "Korean", value: "ko" },
      { label: "Latvian", value: "lv" },
      { label: "Lithuanian", value: "lt" },
      { label: "Macedonian", value: "mk" },
      { label: "Maltese", value: "mt" },
      { label: "Norwegian", value: "no" },
      { label: "Polish", value: "pl" },
      { label: "Portuguese", value: "pt" },
      { label: "Romanian", value: "ro" },
      { label: "Russian", value: "ru" },
      { label: "Scottish", value: "gd" },
      { label: "Serbian", value: "sr" },
      { label: "Serbian", value: "sr" },
      { label: "Slovak", value: "sk" },
      { label: "Slovenian", value: "sl" },
      { label: "Spanish", value: "es" },
      { label: "Swedish", value: "sv" },
      { label: "Turkish", value: "tr" },
      { label: "Ukrainian", value: "uk" }
    ]
  end

  def get_action_classes(action_idx, total_length)
    classes = [
      "relative group bg-white dark:bg-gray-800 dark:border-gray-900 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
    ]
    classes << "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none" if action_idx.zero?
    classes << "sm:rounded-tr-lg" if action_idx == 1
    classes << "sm:rounded-bl-lg" if action_idx == total_length - 2
    classes << "rounded-bl-lg rounded-br-lg sm:rounded-bl-none" if action_idx == total_length - 1
    classes.join(" ")
  end

  def campaign_name(name)
    case name
    when 'campaigns'
      I18n.t('campaigns.mailing')
    when 'user_auto_messages'
      I18n.t('campaigns.in_app')
    else
      name
    end
  end
end
