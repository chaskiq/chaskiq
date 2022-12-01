import React from 'react';

import { Switch, Route, withRouter, Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import Dashboard from './Dashboard';
import Platform from './Platform';
import Conversations from './Conversations';
import Settings from './Settings';
import AppSettings from './AppSettings';
import MessengerSettings from './MessengerSettings';
import Team from './Team';
import Webhooks from './Webhooks';
import Integrations from './Integrations';
import Articles from './Articles';
import Bots from './Bots';
import Campaigns from './Campaigns';
import Profile from './Profile';
import AgentProfile from './AgentProfile';
import Billing from './Billing';
import Api from './Api';
import Reports from './Reports';

import { connect } from 'react-redux';

import UpgradePage from './UpgradePage';
// import Pricing from '../pages/pricingPage'

import CampaignHome from './campaigns/home';
import Progress from '@chaskiq/components/src/components/Progress';
import UserSlide from '@chaskiq/components/src/components/UserSlide';

import { toggleDrawer } from '@chaskiq/store/src/actions/drawer';
import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';
import { updateAppUserPresence } from '@chaskiq/store/src/actions/app_users';
import { setApp } from '@chaskiq/store/src/actions/app';

import UserProfileCard from '@chaskiq/components/src/components/UserProfileCard';
import LoadingView from '@chaskiq/components/src/components/loadingView';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import RestrictedArea, {
  allowedAccessTo,
} from '@chaskiq/components/src/components/AccessDenied';

import Notifications from '@chaskiq/components/src/components/notifications';

import Sidebar from '../layout/sidebar';
import PackageSlider from '../pages/conversations/packageSlider';

import {
  createSubscription,
  destroySubscription,
  eventsSubscriber,
  sendPush,
} from '../shared/actionCableSubscription';
import UserMenu from '../layout/user_menu';
// import {createSubscription, destroySubscription, eventsSubscriber, sendPush } from '../shared/absintheCableSubscription';
import gridIcon from '../images/grid-icon.png';
import logo from '../images/logo.png';
import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import layoutDefinitions from '../layout/layoutDefinitions';
import { MainMenu, MainMenuHorizontal } from "../layout/mainMenu";
declare global {
  interface Window {
    chaskiq_cable_url: any;
  }
}

function AppContainer({
  match,
  dispatch,
  isAuthenticated,
  current_user,
  app,
  drawer,
  app_user,
  loading,
  upgradePages,
  accessToken,
  history,
  current_section
}) {
  const CableApp = React.useRef(createSubscription(match, accessToken));

  const [_subscribed, setSubscribed] = React.useState(null);

  React.useEffect(() => {
    dispatch(getCurrentUser());
    fetchApp(() => {
      eventsSubscriber(
        match.params.appId,
        CableApp.current,
        dispatch,
        fetchApp
      );
    });
    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) destroySubscription(CableApp.current);
    };
  }, [match.params.appId]);

  const fetchApp = (cb) => {
    const id = match.params.appId;
    dispatch(
      setApp(id, {
        success: () => {
          cb && cb();
        },
      })
    );
  };

  React.useEffect(() => {
    function frameCallbackHandler(event) {
      if (event.data.type !== 'url-push-from-frame') return;
      console.log('HANDLED EVENT FROM FRAME', event.data);
      history.push(event.data.url);
    }

    window.addEventListener('message', frameCallbackHandler);
    return () => window.removeEventListener('message', frameCallbackHandler);
  }, []);

  function updateUser(data) {
    dispatch(updateAppUserPresence(data));
  }

  function handleSidebar() {
    dispatch(toggleDrawer({ open: !drawer.open }));
  }

  function handleUserSidebar() {
    dispatch(toggleDrawer({ userDrawer: !drawer.userDrawer }));
  }

  function pushEvent(name, data) {
    sendPush(name, {
      props: { app },
      events: CableApp.current.events,
      data: data,
    });
  }

  const layout = layoutDefinitions();

  return (
    <React.Fragment>
      <div className="secondary-50 newBlue-300 fixed w-full top-0 z-10 bg-gradient-to-r from-gradientHero via-gradientHero-100 to-gradientHero-200">
        <div className="mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="flex space-x-8 items-center">
              <div className="relative z-50 cursor-pointer">
                <FilterMenu
                  options={layout.optionsForFilter}
                  value={null}
                  panelClass={
                    'absolute left-0 grid grid-rows-3 grid-flow-col gap-4 p-2 min-w-max mt-2 origin-top-right bg-white dark:bg-darkColor-900 rounded-md shadow-lg'
                  }
                  filterHandler={(e) => console.log(e)}
                  triggerButton={(handler) => (
                    <button
                      className="flex items-center justify-center outline outline-0"
                      id="headlessui-menu-button-2"
                      onClick={handler}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className="outline-0 flex items-center justify-center space-x-2 text-white select-none">
                        <img
                          alt="menu"
                          src={gridIcon}
                          className="w-5 h-5 outline-0"
                        />
                      </span>
                    </button>
                  )}
                  position={'left'}
                />
              </div>

              {layoutDefinitions().menuLeft.map((o) => (
                <Link
                  to={o.href}
                  key={o.key}
                  className="flex space-x-3 items-center cursor-pointer"
                >
                  <img className="block w-24" src={o.icon} alt={o.title} />
                </Link>
              ))}
            </span>

            <span className="flex items-center space-x-4">
              <div className="relative z-50 cursor-pointer">
                <UserMenu
                  triggerButton={(handler) => (
                    <button
                      onClick={handler}
                      id="user_menu"
                      className="text-xs leading-4 font-medium text-gray-500 group-hover:text-gray-700 group-focus:underline transition ease-in-out duration-150"
                    >
                      <div className="flex items-center">
                        <span className="flex items-center space-x-2 text-white">
                          <span className="flex flex-grow min-w-8 w-8 h-8 items-center justify-center uppercase bg-link text-white rounded-full text-xs shadow-lg">
                            <img
                              className="w-max h-max rounded-full"
                              src={current_user.avatarUrl}
                              alt={current_user.email}
                              width={40}
                              height={40}
                            />
                          </span>
                          <div className="flex flex-col items-start">
                            <span className="text-xs">
                              {current_user.email}
                            </span>
                            <span className="text-xs opacity-70"></span>
                          </div>
                          <span>
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth="0"
                              viewBox="0 0 16 16"
                              className="h-2"
                              height="1em"
                              width="1em"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"></path>
                            </svg>
                          </span>
                        </span>
                      </div>
                    </button>
                  )}
                  position={'right'}
                  origin={'top-50'}
                />
              </div>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white border-b">
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {app && <MainMenu
              app={app} 
              itemClass="h-16 inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
              categories={null}
              current_section={current_section} 
            />}
          </div>
        </div>
      </div>

      <div
        className="mt-32 h-screen flex overflow-hidden bg-white dark:bg-gray-900 dark:text-white"
        style={{ height: layout.screenHeight || '100vh' }}
      >
        {app && <Sidebar />}

        {drawer.open && (
          <div
            onClick={handleSidebar}
            style={{
              background: '#000',
              position: 'fixed',
              opacity: 0.7,
              zIndex: 1,
              width: '100vw',
              height: '100vh',
            }}
          />
        )}

        <Notifications history={history} />

        {drawer.userDrawer && (
          <UserSlide open={!!drawer.userDrawer} onClose={handleUserSidebar}>
            {app_user ? <UserProfileCard width={'300px'} /> : <Progress />}
          </UserSlide>
        )}

        {loading || (!app && <LoadingView />)}

        {isAuthenticated && current_user.email && (
          <div className="flex flex-col w-0 flex-1 overflow-auto---">
            <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
              <button
                onClick={handleSidebar}
                className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {!isEmpty(upgradePages) && <UpgradePage page={upgradePages} />}

            {app && isEmpty(upgradePages) && (
              <ErrorBoundary variant={'very-wrong'}>
                <Switch>
                  <Route path={`${match.url}/`} exact>
                    <Dashboard />
                  </Route>

                  <Route exact path={`${match.path}/segments/:segmentID/:Jwt?`}>
                    <RestrictedArea section="segments">
                      <Platform />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/settings`}>
                    <Settings />
                  </Route>

                  <Route path={`${match.url}/app_settings`}>
                    <RestrictedArea section="app_settings">
                      <AppSettings />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/messenger`}>
                    <RestrictedArea section="messenger_settings">
                      <MessengerSettings />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/team`}>
                    <RestrictedArea section="team">
                      <Team />
                    </RestrictedArea>
                  </Route>

                  <Route
                    exact
                    path={`${match.path}/users/:id`}
                    render={(props) => <Profile {...props} />}
                  />

                  <Route
                    exact
                    path={`${match.path}/agents/:id`}
                    render={(props) => <AgentProfile {...props} />}
                  />

                  <Route path={`${match.url}/webhooks`}>
                    <RestrictedArea section="outgoing_webhooks">
                      <Webhooks />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/integrations`}>
                    <RestrictedArea section="app_packages">
                      <Integrations />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/reports`}>
                    <RestrictedArea section="reports">
                      <Reports />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/articles`}>
                    <RestrictedArea section="help_center">
                      <Articles />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/conversations`}>
                    <RestrictedArea section="conversations">
                      <Conversations
                        subscribed
                        pushEvent={pushEvent}
                        events={CableApp.current.events}
                      />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/oauth_applications`}>
                    <RestrictedArea section="oauth_applications">
                      <Api />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/billing`}>
                    <RestrictedArea section="billing">
                      <Billing />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/bots`}>
                    <RestrictedArea section="routing_bots">
                      <Bots />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/campaigns`}>
                    <CampaignHome />
                  </Route>

                  <Route path={`${match.path}/messages/:message_type`}>
                    <RestrictedArea section="campaigns">
                      <Campaigns />
                    </RestrictedArea>
                  </Route>
                </Switch>
              </ErrorBoundary>
            )}
          </div>
        )}
        {app && allowedAccessTo(app, 'fixed_app_packages') && <PackageSlider />}
      </div>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const {
    auth,
    drawer,
    app,
    segment,
    app_user,
    app_users,
    current_user,
    navigation,
    paddleSubscription,
    upgradePages,
    fixedSlider,
    notifications,
  } = state;
  const { loading, isAuthenticated, accessToken } = auth;
  const { current_section } = navigation;
  return {
    segment,
    app_users,
    app_user,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section,
    drawer,
    paddleSubscription,
    upgradePages,
    accessToken,
    fixedSlider,
  };
}

export default withRouter(connect(mapStateToProps)(AppContainer));
