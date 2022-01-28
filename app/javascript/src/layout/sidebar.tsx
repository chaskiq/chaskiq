import React, { useState, useEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Tooltip from 'rc-tooltip';
import icon from '../images/favicon.png';
import {
  MoreIcon,
  DashboardIcon,
  PlatformIcon,
  ConversationChatIcon,
  AssignmentIcon,
  CampaignsIcon,
  MailingIcon,
  AutoMessages,
  BannersIcon,
  ToursIcon,
  BotIcon,
  OutboundIcon,
  NewconversationIcon,
  SettingsIcon,
  HelpCenterIcon,
  ArticlesIcon,
  CollectionsIcon,
  ChatIcon,
  DarkModeIcon,
  LightModeIcon,
  ChartsIcons,
  KeyIcon,
} from '@chaskiq/components/src/components/icons';

import { escapeHTML } from '@chaskiq/components/src/utils/htmlSanitize';

import I18n from '../shared/FakeI18n';

import SidebarAgents from '../pages/conversations/SidebarAgents';

import SidebarReportMenu from '../pages/reports/SidebarMenu';

import graphql from '@chaskiq/store/src/graphql/client';

import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import WebSetup from '@chaskiq/components/src/components/webSetup';
import LangChooser from '@chaskiq/components/src/components/LangChooser';
import Badge from '@chaskiq/components/src/components/Badge';

import { UPDATE_AGENT } from '@chaskiq/store/src/graphql/mutations';

import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';
import { toggleTheme } from '@chaskiq/store/src/actions/theme';
import { signout } from '@chaskiq/store/src/actions/auth';

import SwitchControl from '@chaskiq/components/src/components/Switch';

import { allowedAccessTo } from '@chaskiq/components/src/components/AccessDenied';
import { LangGlobeIcon } from '@chaskiq/components/src/components/icons';
import { PlusIcon } from '@chaskiq/components/src/components/icons';
import { EditIcon } from '@chaskiq/components/src/components/icons';
import { LogoutIcon } from '@chaskiq/components/src/components/icons';

// Icons from https://teenyicons.com/
import app_settings_items from './settingsItems';
declare global {
  interface Window {
    location: Location;
  }
}

function mapStateToProps(state) {
  const {
    auth,
    drawer,
    app,
    segment,
    app_users,
    current_user,
    navigation,
    theme,
  } = state;
  const { loading, isAuthenticated } = auth;
  return {
    segment,
    app_users,
    current_user,
    app,
    loading,
    isAuthenticated,
    navigation,
    drawer,
    theme,
  };
}

function Sidebar({
  app,
  dispatch,
  navigation,
  current_user,
  drawer,
  history,
  theme,
}) {
  const { current_page, current_section } = navigation;

  const [_expanded, setExpanded] = useState(current_section);
  const [loading, setLoading] = useState(false);

  const [langChooser, setLangChooser] = useState(false);

  useEffect(() => {
    setExpanded(current_section);
  }, [current_section]);

  function isActivePage(page) {
    /// console.log("selected page", current_page , page)
    return current_page === page;
  }

  function handleSignout() {
    dispatch(signout());
  }

  const appid = `/apps/${app.key}`;

  const categories = [
    {
      id: 'Dashboard',
      label: I18n.t('navigator.dashboard'),
      icon: <DashboardIcon />,
      url: `/apps/${app.key}`,
      hidden: true,
      children: [
        /* {
          id: 'campaigns', label: 'Mailing Campaigns',
          icon: <EmailIcon/>,
          url: `${appid}/messages/campaigns`,
          active: isActivePage("campaigns")
        } */
        {
          render: (_props) => [
            <div key={'dashboard-hey'} className="space-y-2">
              <p
                className="text-sm leading-5 text-gray-500 dark:text-gray-100 font-light"
                dangerouslySetInnerHTML={{
                  __html: I18n.t('dashboard.hey', {
                    name: escapeHTML(app.name),
                  }),
                }}
              />
              <WebSetup />
            </div>,
          ],
        },
        {
          render: (_props) => [
            <div key={'dashboard-status'} className="space-y-2">
              <div
                className="mt-1 space-y-1"
                aria-labelledby="projects-headline"
              >
                {app.plan.name && (
                  <Link
                    to={`/apps/${app.key}/billing`}
                    className="group flex items-center py-2 text-sm font-medium text-gray-600 dark:text-gray-100 rounded-md hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-black"
                  >
                    <span className="truncate">
                      Plan:{' '}
                      <Badge size="sm" variant="pink">
                        {app.plan.name}
                      </Badge>
                    </span>
                  </Link>
                )}

                <Link
                  to={`/apps/${app.key}/messenger`}
                  className="group flex items-center py-2 text-sm font-medium text-gray-600 dark:text-gray-100 rounded-md dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-black"
                >
                  <span className="truncate--">
                    {I18n.t('dashboard.status')}{' '}
                    {app.activeMessenger && (
                      <Badge size="sm" variant="green">
                        {I18n.t('dashboard.status_running')}
                      </Badge>
                    )}
                    {!app.activeMessenger && (
                      <Badge size="sm" variant="gray">
                        {I18n.t('dashboard.status_paused')}
                      </Badge>
                    )}
                  </span>
                </Link>

                <a
                  href="https://dev.chaskiq.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center py-2 text-sm font-medium text-gray-600 dark:text-gray-100 rounded-md dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-black"
                >
                  <span className="truncate">{I18n.t('dashboard.guides')}</span>
                </a>
              </div>
            </div>,
          ],
        },
      ],
    },
    {
      id: 'Platform',
      label: I18n.t('navigator.platform'),
      icon: <PlatformIcon />,
      url: `/apps/${app.key}/segments/${
        app.segments.length > 0 ? app.segments[0].id : ''
      }`,
      children: app.segments.map((o) => ({
        id: o.name,
        icon: null,
        url: `/apps/${app.key}/segments/${o.id}`,
        active: isActivePage(`segment-${o.id}`),
        allowed: allowedAccessTo(app, 'segments'),
      })),
    },
    {
      id: 'Conversations',
      label: I18n.t('navigator.conversations'),
      icon: <ChatIcon />,
      url: `/apps/${app.key}/conversations`,
      children: [
        {
          id: 'Conversations',
          label: I18n.t('navigator.childs.conversations'),
          icon: <ConversationChatIcon />,
          url: `/apps/${app.key}/conversations`,
          active: isActivePage('Conversations'),
          allowed: allowedAccessTo(app, 'conversations'),
        },
        {
          id: 'AssignmentRules',
          icon: <AssignmentIcon />,
          label: I18n.t('navigator.childs.assignment_rules'),
          url: `/apps/${app.key}/conversations/assignment_rules`,
          active: isActivePage('Assignment Rules'),
          allowed: allowedAccessTo(app, 'conversations'),
        },
        {
          id: 'SidebarAgents',
          render: () => [
            <SidebarAgents key={'conversations-sidebar-agents'} />,
          ],
        },
      ],
    },
    {
      id: 'Campaigns',
      label: I18n.t('navigator.campaigns'),
      url: `/apps/${app.key}/campaigns`,
      icon: <CampaignsIcon />,
      children: [
        {
          id: 'campaigns',
          label: I18n.t('navigator.childs.mailing_campaigns'),
          icon: <MailingIcon />,
          url: `${appid}/messages/campaigns`,
          active: isActivePage('campaigns'),
          allowed: allowedAccessTo(app, 'campaigns'),
        },
        {
          id: 'user_auto_messages',
          label: I18n.t('navigator.childs.in_app_messages'),
          icon: <AutoMessages />,
          url: `${appid}/messages/user_auto_messages`,
          active: isActivePage('user_auto_messages'),
          allowed: allowedAccessTo(app, 'campaigns'),
        },
        {
          id: 'banners',
          label: I18n.t('navigator.childs.banners'),
          icon: <BannersIcon />,
          url: `${appid}/messages/banners`,
          active: isActivePage('banners'),
          allowed: allowedAccessTo(app, 'campaigns'),
        },
        {
          id: 'tours',
          label: I18n.t('navigator.childs.guided_tours'),
          icon: <ToursIcon />,
          url: `${appid}/messages/tours`,
          active: isActivePage('tours'),
          allowed: allowedAccessTo(app, 'campaigns'),
        },
      ],
    },

    {
      id: 'Bot',
      label: I18n.t('navigator.routing_bots'),
      icon: <BotIcon />,
      url: `/apps/${app.key}/bots/settings`,
      children: [
        {
          id: 'outbound',
          label: I18n.t('navigator.childs.outbound'),
          icon: <OutboundIcon />,
          url: `${appid}/bots/outbound`,
          active: isActivePage('bot_outbound'),
          allowed: allowedAccessTo(app, 'bots'),
        },
        {
          id: 'user_conversations',
          label: I18n.t('navigator.childs.new_conversations'),
          icon: <NewconversationIcon />,
          url: `${appid}/bots/new_conversations`,
          active: isActivePage('bot_new_conversations'),
          allowed: allowedAccessTo(app, 'bots'),
        },
        {
          id: 'Settings',
          label: I18n.t('navigator.childs.bot_settings'),
          icon: <SettingsIcon />,
          url: `${appid}/bots/settings`,
          active: isActivePage('bot_settings'),
          allowed: allowedAccessTo(app, 'bots'),
        },
      ],
    },

    {
      label: I18n.t('navigator.help_center'),
      id: 'HelpCenter',
      icon: <HelpCenterIcon />,
      url: `/apps/${app.key}/articles`,
      children: [
        {
          id: 'Articles',
          label: I18n.t('navigator.childs.articles'),
          icon: <ArticlesIcon />,
          url: `/apps/${app.key}/articles`,
          active: isActivePage('Articles'),
          allowed: allowedAccessTo(app, 'help_center'),
        },
        {
          id: 'Collections',
          label: I18n.t('navigator.childs.collections'),
          icon: <CollectionsIcon />,
          url: `/apps/${app.key}/articles/collections`,
          active: isActivePage('Collections'),
          allowed: allowedAccessTo(app, 'help_center'),
        },
        {
          id: 'Settings',
          label: I18n.t('navigator.childs.article_settings'),
          icon: <SettingsIcon />,
          url: `/apps/${app.key}/articles/settings`,
          active: isActivePage('Settings'),
          allowed: allowedAccessTo(app, 'help_center'),
        },
      ],
    },
    {
      id: 'Reports',
      label: 'Reports',
      icon: <ChartsIcons />,
      url: `/apps/${app.key}/reports`,
      children: [
        {
          id: 'ReportsMenu',
          allowed: allowedAccessTo(app, 'reports'),
          render: () => [<SidebarReportMenu key={'reports-sidebar-menu'} />],
        },
      ],
    },
    {
      id: 'Settings',
      label: I18n.t('navigator.settings'),
      icon: (
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
        >
          <path
            clipRule="evenodd"
            d="M5.944.5l-.086.437-.329 1.598a5.52 5.52 0 00-1.434.823L2.487 2.82l-.432-.133-.224.385L.724 4.923.5 5.31l.328.287 1.244 1.058c-.045.277-.103.55-.103.841 0 .291.058.565.103.842L.828 9.395.5 9.682l.224.386 1.107 1.85.224.387.432-.135 1.608-.537c.431.338.908.622 1.434.823l.329 1.598.086.437h3.111l.087-.437.328-1.598a5.524 5.524 0 001.434-.823l1.608.537.432.135.225-.386 1.106-1.851.225-.386-.329-.287-1.244-1.058c.046-.277.103-.55.103-.842 0-.29-.057-.564-.103-.841l1.244-1.058.329-.287-.225-.386-1.106-1.85-.225-.386-.432.134-1.608.537a5.52 5.52 0 00-1.434-.823L9.142.937 9.055.5H5.944z"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="round"
          ></path>
          <path
            clipRule="evenodd"
            d="M9.5 7.495a2 2 0 01-4 0 2 2 0 014 0z"
            stroke="currentColor"
            strokeLinecap="square"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
      url: `/apps/${app.key}/settings`,
      children: app_settings_items(app, isActivePage),
    },
  ];

  function renderInner() {
    return categories
      .filter((o) => o.id === current_section)
      .map(({ id, label, children }) => {
        //  expanded={expanded === id}
        return (
          <div
            key={`sidebar-section-${id}`}
            className="h-0-- flex-1 flex flex-col pt-5 pb-4 overflow-y-auto"
          >
            <div
              className="flex items-center flex-shrink-0 px-4
              text-lg leading-6 font-bold text-gray-900 dark:text-gray-100"
            >
              <h3 className="font-bold w-full">{label}</h3>
            </div>
            <nav className="mt-5 flex-1 px-4 space-y-2">
              {children
                .filter((o) => !o.hidden)
                .map(
                  ({
                    id: childId,
                    label,
                    icon,
                    active,
                    url,
                    _onClick,
                    render,
                    allowed,
                  }) =>
                    !render ? (
                      <Link
                        key={`sidebar-section-child-${id}-${childId}`}
                        to={url}
                        aria-label={label}
                        disabled={!allowed}
                        className={`
                        ${active ? 'bg-gray-200 dark:bg-black' : ''} 
                        ${!allowed ? 'bg-gray-100 dark:bg-gray-100' : ''} 
                        bg-white hover:text-gray-600 hover:bg-gray-100 
                        dark:hover:text-gray-300 dark:hover:bg-black
                        dark:bg-black dark:text-gray-100 dark:focus:bg-black
                        focus:outline-none focus:bg-gray-200
                        group flex items-center 
                        px-2 py-2 
                        text-sm leading-5 font-medium text-gray-900 
                        rounded-md transition ease-in-out duration-150`}
                      >
                        <div className="text-lg mr-3 h-6 w-6 dark:text-gray-100 text-gray-500 group-hover:text-gray-500 group-focus:text-gray-600 transition ease-in-out duration-150">
                          {icon}
                        </div>
                        {label || childId}
                      </Link>
                    ) : (
                      render()
                    )
                )}
            </nav>
          </div>
        );
      });
  }

  function openLangChooser() {
    setLangChooser(true);
  }

  function handleAwaymode(_e) {
    setLoading(true);

    graphql(
      UPDATE_AGENT,
      {
        appKey: app.key,
        email: current_user.email,
        params: {
          available: !current_user.available,
        },
      },
      {
        success: (_data) => {
          dispatch(getCurrentUser());
          setLoading(false);
        },
        error: () => {
          setLoading(false);
        },
      }
    );
  }

  const drawerClass = !drawer.open
    ? 'hidden'
    : 'absolute flex md:flex-shrink-0 z-50 h-screen';

  return (
    <div className={`${drawerClass} md:flex md:flex-shrink-0`}>
      {app && (
        <div
          className={`md:block 
            bg-white dark:bg-black
            text-purple-lighter 
            flex-none w-23 
            p-2 
            border-r border-gray-300 dark:border-gray-800`}
        >
          <div className="cursor-pointer mb-4">
            <div className="bg-white h-10 w-10 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
              <Link to={'/apps'}>
                <img src={icon} alt="" />
              </Link>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {categories.map((o) => (
              <Tooltip
                key={`sidebar-categories-${o.id}`}
                placement="right"
                overlay={o.label}
              >
                {o.url && (
                  <Link
                    to={`${o.url}`}
                    aria-label={o.label}
                    className="text-gray-700 dark:text-white
                    rounded-md flex 
                    justify-center 
                    cursor-pointer bg-gray-50 dark:bg-black
                    hover:bg-gray-100 dark:hover:bg-gray-800 
                    h-10 w-full 
                    items-center 
                    text-2xl font-semibold 
                    my-5 overflow-hidden"
                  >
                    {o.icon}
                  </Link>
                )}
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {langChooser && (
        <LangChooser open={langChooser} handleClose={setLangChooser} />
      )}

      {current_page && (
        <div className="md:flex flex-col w-56 border-r border-gray-200 dark:border-gray-900 dark:bg-black bg-gray-100 shadow-inner">
          <div className="py-2 flex items-center flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-900 bg-yellow-50 dark:bg-yellow-400">
            <h3 className="font-semibold w-full text-gray-600 text-xs">
              {app.name}
            </h3>
          </div>

          {renderInner()}

          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 px-3 py-2">
            <div className="flex-shrink-0 group block focus:outline-none">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={current_user.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                  />
                </div>
                <div className="ml-3 w-2/5 flex flex-wrap">
                  <p className="my-1 text-sm leading-5 font-medium text-gray-700 dark:text-gray-50 dark:hover:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-300 truncate">
                    <Link to={`/apps/${app.key}/agents/${current_user.id}`}>
                      {current_user.email}
                    </Link>
                  </p>

                  <div className="flex items-center space-x-2">
                    <SwitchControl
                      label={
                        <span className="text-xs text-gray-500 dark:text-gray-50">
                          {I18n.t('common.away_mode')}
                        </span>
                      }
                      setEnabled={handleAwaymode}
                      enabled={current_user.available}
                    ></SwitchControl>

                    <FilterMenu
                      options={[
                        {
                          title: I18n.t('navigator.user_menu.create_app'),
                          description: I18n.t(
                            'navigator.user_menu.create_app_description'
                          ),
                          id: 'new-app',
                          onClick: () => history.push('/apps/new'),
                          icon: <PlusIcon />,
                        },

                        {
                          id: 'choose-lang',
                          title: I18n.t('home.choose_lang'),
                          onClick: openLangChooser,
                          icon: <LangGlobeIcon />,
                        },
                        {
                          id: 'edit-profile',
                          title: I18n.t('home.edit_profile'),
                          icon: <EditIcon />,
                          onClick: () =>
                            history.push(
                              `/apps/${app.key}/agents/${current_user.id}`
                            ),
                          //onClick: () =>
                          //  (window.location.href = '/agents/edit'),
                        },
                        {
                          id: 'edit-credentials',
                          title: I18n.t('home.edit_credentials'),
                          icon: (
                            <span className="flex space-x-2 items-center">
                              <KeyIcon />
                            </span>
                          ),
                          onClick: () =>
                            (window.location.href = '/agents/edit'),
                        },
                        {
                          id: 'toggle-dark-mode',
                          title:
                            theme === 'light'
                              ? I18n.t('common.toggle_dark_mode')
                              : I18n.t('common.toggle_light_mode'),
                          icon:
                            theme === 'light' ? (
                              <DarkModeIcon />
                            ) : (
                              <LightModeIcon />
                            ),
                          onClick: () =>
                            dispatch(
                              toggleTheme(theme === 'light' ? 'dark' : 'light')
                            ),
                        },
                        {
                          title: I18n.t('navigator.user_menu.signout'),
                          icon: <LogoutIcon />,
                          id: 'sign-out',
                          onClick: handleSignout,
                        },
                      ]}
                      value={null}
                      filterHandler={(e) => e.onClick && e.onClick()}
                      triggerButton={(handler) => (
                        <button
                          onClick={handler}
                          id="user_menu"
                          className="text-xs leading-4 font-medium text-gray-500 group-hover:text-gray-700 group-focus:underline transition ease-in-out duration-150"
                        >
                          <div className="flex items-center">
                            {/*
                              I18n.t('navigator.user_menu.title')
                            */}
                            <MoreIcon />
                          </div>
                        </button>
                      )}
                      position={'left'}
                      origin={'bottom-0'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withRouter(connect(mapStateToProps)(Sidebar));
