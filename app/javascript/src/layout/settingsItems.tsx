import React from 'react';
import { allowedAccessTo } from '@chaskiq/components/src/components/AccessDenied';
import I18n from '../shared/FakeI18n';

import {
  WebhooksIcon,
  ApiIcon,
  BillingIcon,
  IntegrationsIcon,
  TeamIcon,
  MessengerIcon,
  AppSettingsIcon,
} from '@chaskiq/components/src/components/icons';

export default function settingsItems(app, isActivePage) {
  return [
    {
      id: 'App Settings',
      label: I18n.t('navigator.childs.app_settings'),
      icon: <AppSettingsIcon />,
      url: `/apps/${app.key}/app_settings`,
      active: isActivePage('app_settings'),
      allowed: allowedAccessTo(app, 'app_settings'),
    },

    {
      id: 'Messenger',
      label: I18n.t('navigator.childs.messenger_settings'),
      icon: <MessengerIcon />,
      url: `/apps/${app.key}/messenger`,
      active: isActivePage('messenger'),
      allowed: allowedAccessTo(app, 'app_settings'),
    },

    {
      id: 'Team',
      label: I18n.t('navigator.childs.team'),
      icon: <TeamIcon />,
      url: `/apps/${app.key}/team`,
      active: isActivePage('team'),
      allowed: allowedAccessTo(app, 'team'),
    },
    {
      id: 'Integrations',
      label: I18n.t('navigator.childs.integrations'),
      icon: <IntegrationsIcon />,
      url: `/apps/${app.key}/integrations`,
      active: isActivePage('integrations'),
      allowed: allowedAccessTo(app, 'app_packages'),
    },
    {
      id: 'Webhooks',
      label: I18n.t('navigator.childs.webhooks'),
      icon: <WebhooksIcon />,
      url: `/apps/${app.key}/webhooks`,
      active: isActivePage('webhooks'),
      allowed: allowedAccessTo(app, 'outgoing_webhooks'),
    },
    {
      id: 'Api access',
      label: I18n.t('navigator.childs.api_access'),
      icon: <ApiIcon />,
      url: `/apps/${app.key}/oauth_applications`,
      active: isActivePage('oauth_applications'),
      allowed: allowedAccessTo(app, 'oauth_applications'),
    },
    {
      id: 'Billing',
      icon: <BillingIcon />,
      hidden: !app.subscriptionsEnabled,
      label: I18n.t('navigator.childs.billing'),
      url: `/apps/${app.key}/billing`,
      active: isActivePage('billing'),
      allowed: allowedAccessTo(app, 'billing'),
    },
    // { id: 'Authentication', icon: <ShuffleIcon />, active: isActivePage("user_auto_messages")},
  ];
}
