import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import {
  LogoutIcon,
  MoreIcon,
  LangGlobeIcon,
  PlusIcon,
  EditIcon,
  KeyIcon,
  DarkModeIcon,
  LightModeIcon,
} from '@chaskiq/components/src/components/icons';
import React from 'react';
import I18n from '../shared/FakeI18n';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleTheme } from '@chaskiq/store/src/actions/theme';
import { signout } from '@chaskiq/store/src/actions/auth';

function UserMenu({
  openLangChooser,
  current_user,
  app,
  dispatch,
  history,
  theme,
  triggerButton,
  position,
  origin,
}) {
  function handleSignout() {
    //@ts-ignore
    window?.chaskiqSupport?.shutdown();
    if (auth0Domain) return history.push('/logout');
    dispatch(signout());
  }

  //@ts-ignore
  const auth0Domain = document.querySelector(
    'meta[name="auth0-domain"]'
  )?.content;

  return (
    <FilterMenu
      options={[
        {
          title: I18n.t('navigator.user_menu.create_app'),
          description: I18n.t('navigator.user_menu.create_app_description'),
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
            history.push(`/apps/${app.key}/agents/${current_user.id}`),
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
          onClick: () => (window.location.href = '/agents/edit'),
        },
        {
          id: 'toggle-dark-mode',
          title:
            theme === 'light'
              ? I18n.t('common.toggle_dark_mode')
              : I18n.t('common.toggle_light_mode'),
          icon: theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />,
          onClick: () =>
            dispatch(toggleTheme(theme === 'light' ? 'dark' : 'light')),
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
      triggerButton={triggerButton}
      position={position || 'left'}
      origin={origin || 'bottom-0'}
    />
  );
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

export default withRouter(connect(mapStateToProps)(UserMenu));
