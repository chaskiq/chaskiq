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
    app_key = ENV["SUPPORT_APP_KEY"]
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

  def billing_menu_data
    [
      {
        label: I18n.t('subscriptions.tabs')[0],
        active: controller.controller_name == 'team',
        href: app_team_index_path(@app.key)
      },
      {
        label: I18n.t('subscriptions.tabs')[1],
        active: controller.controller_name == 'team',
        href: app_team_index_path(@app.key),
      },
    ]
  end

  def oauth_apps_menu_data
    [
      {
        label: I18n.t('settings.api.tabs.apps'),
        active: controller.controller_name == 'team',
        href: app_team_index_path(@app.key)
      },
      {
        label: I18n.t('settings.api.tabs.authorized'),
        active: controller.controller_name == 'team',
        href: app_team_index_path(@app.key)
      }
    ]
  end

  def team_menu_data
    [{
      href: app_team_index_path(@app.key),
      label: I18n.t('settings.team.title'),
      active: controller.controller_name == 'team'
    },
    {
      href: app_invitations_path(@app.key),
      label: I18n.t('settings.team.invitations'),
      active: controller.controller_name == 'invitations'
    }]
  end

  def settings_menu_data
    [
			{
				label: I18n.t('settings.app.app_settings'),
				href: app_settings_path(@app.key),
				active: controller.controller_name == 'settings'
			},
			{
				label: I18n.t('settings.app.security'),
				href: app_security_index_path(@app.key),
				active: controller.controller_name == 'security'
			},
			{
				label: I18n.t('settings.app.user_data'),
				href: app_user_data_path(@app.key),
				active: controller.controller_name == 'user_data'
			},
			{
				label: I18n.t('settings.app.tags'),
				href: app_tags_path(@app.key),
				active: controller.controller_name == 'tags'
			},
			{
				label: I18n.t('settings.app.quick_replies'),
				href: app_quick_replies_path(@app.key),
				active: controller.controller_name == 'quick_replies'
			},
			{
				label: I18n.t('settings.app.email_forwarding'),
				href: app_email_forwarding_index_path(@app.key),
				active: controller.controller_name == 'email_forwarding',
			}
		]
  end

  def webhooks_menu_data
    [{
      label: I18n.t('settings.webhooks.active_webhooks'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'      
    },
    {
      label: I18n.t('settings.webhooks.disabled_webhooks'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    }]
  end

  def integrations_menu_data
    [{
      label: I18n.t('settings.integrations.active.title'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.integrations.available.title'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.integrations.yours.title'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    }]

  end

  def messenger_menu_data
    [{
      label: I18n.t('settings.app.appearance'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.translations'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.privacy'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: 'Apps',
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.availability'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.email_requirement'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.inbound_settings'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    },
    {
      label: I18n.t('settings.app.messenger_style'),
      href: app_webhooks_path(@app.key),
      active: controller.controller_name == 'webhooks'
    }]
  end


end
