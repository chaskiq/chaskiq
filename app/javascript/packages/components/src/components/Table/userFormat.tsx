import React from 'react';
import Moment from 'react-moment';
import Badge from '../Badge';
import Avatar from '../Avatar';
import I18n from '../../../../../src/shared/FakeI18n';

const userFormat = function (showUserDrawer, app) {
  let opts = [
    // {field: 'id', title: 'id' },
    {
      field: 'name',
      title: I18n.t('data_tables.users.name'),
      render: (row) => {
        return (
          row && (
            <div
              onClick={() => showUserDrawer && showUserDrawer(row)}
              className="flex items-center"
            >
              <div className="flex-shrink-0 h-10 w-10">
                <Avatar
                  size={'medium'}
                  alt={row.id}
                  src={row.avatarUrl}
                  indicator={row.online}
                />
              </div>
              <div className="ml-4">
                <div className="text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
                  {row.displayName}
                </div>
                <div className="text-sm leading-5 text-gray-500 dark:text-gray-300">
                  {row.email}
                </div>
              </div>
            </div>
          )
        );
      },
    },
    {
      field: 'email',
      title: I18n.t('data_tables.users.email'),
      hidden: true,
    },
    { field: 'ip', title: I18n.t('data_tables.users.ip'), hidden: true },
    {
      field: 'country',
      title: I18n.t('data_tables.users.country'),
      hidden: true,
    },
    {
      field: 'city',
      title: I18n.t('data_tables.users.city'),
      hidden: true,
    },
    {
      field: 'tagList',
      title: I18n.t('data_tables.users.tag_list'),
      hidden: false,
      render: (row) => (
        <div className="flex flex-wrap space-y-1">
          {row.tagList.map((tag, i) => (
            <Badge key={`tags-${row.id}-${i}`} size="sm" variant={'gray'}>
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      field: 'state',
      title: I18n.t('data_tables.users.state'),
      render: (row) => {
        return (
          <Badge variant={row.state === 'subscribed' ? 'green' : 'yellow'}>
            {I18n.t(`data_tables.users.subscription_status.${row.state}`)}
          </Badge>
        );
      },
    },
    {
      field: 'online',
      title: I18n.t('data_tables.users.online'),
      hidden: true,
    },
    { field: 'lat', title: I18n.t('data_tables.users.lat'), hidden: true },
    { field: 'lng', title: I18n.t('data_tables.users.lng'), hidden: true },
    {
      field: 'postal',
      title: I18n.t('data_tables.users.postal'),
      hidden: true,
    },
    {
      field: 'browser',
      title: I18n.t('data_tables.users.browser'),
      hidden: true,
    },
    {
      field: 'browser_version',
      title: I18n.t('data_tables.users.browser_version'),
      hidden: true,
    },
    {
      field: 'browserLanguage',
      title: I18n.t('data_tables.users.browser_lang'),
      hidden: true,
    },
    {
      field: 'referrer',
      title: I18n.t('data_tables.users.referrer'),
      hidden: true,
    },
    { field: 'os', title: I18n.t('data_tables.users.os'), hidden: true },
    {
      field: 'osVersion',
      title: I18n.t('data_tables.users.os_version'),
      hidden: true,
    },
    {
      field: 'lang',
      title: I18n.t('data_tables.users.lang'),
      hidden: true,
    },
    {
      field: 'webSessions',
      title: I18n.t('data_tables.users.web_sessions'),
    },
    { field: 'lastSeen', title: I18n.t('data_tables.users.last_seen') },
    { field: 'firstSeen', title: I18n.t('data_tables.users.first_seen') },

    {
      field: 'lastVisitedAt',
      title: 'Last visited at',
      render: (row) => row && <Moment fromNow>{row.lastVisitedAt}</Moment>,
    },
  ];

  if (app.customFields && app.customFields.length > 0) {
    const other = app.customFields.map((o) => ({
      hidden: true,
      field: o.name,
      title: o.name,
      render: (row) => row && row.properties[o.name],
    }));
    opts = opts.concat(other);
  }

  return opts;
};

export default userFormat;
