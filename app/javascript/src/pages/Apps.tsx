// src/App.js
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import I18n from '../shared/FakeI18n';

import bg from '../images/bg/welcome-icon8.png';

import styled from '@emotion/styled';

import graphql from '@chaskiq/store/src/graphql/client';

import LoadingView from '@chaskiq/components/src/components/loadingView';
import Badge from '@chaskiq/components/src/components/Badge';
import Card from '@chaskiq/components/src/components/Card';

import { connect } from 'react-redux';
import logo from '../images/favicon.png';

import { APPS } from '@chaskiq/store/src/graphql/queries';

import { setCurrentSection } from '@chaskiq/store/src/actions/navigation';

import { clearApp } from '@chaskiq/store/src/actions/app';

const Container = styled.div`
  background: url(${bg});
  background-repeat: no-repeat;
  background-position-x: right;
  height: 100vh;
  marginbottom: 0px;
`;

function App({ dispatch, loading }) {
  const [apps, setApps] = React.useState([]);
  const [canCreateApps, setCanCreateApps] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    dispatch(setCurrentSection(null));
    dispatch(clearApp());
    graphql(
      APPS,
      {},
      {
        success: (data) => {
          setApps(data.apps);
          setCanCreateApps(data.canCreateApps);
          setReady(true);
        },
        error: () => {},
      }
    );
  }, []);

  return (
    <Container className="h-screen flex overflow-hidden bg-white">
      {loading || (!ready && <LoadingView />)}

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150">
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

        <main className="flex-1 relative z-0 overflow-y-auto pt-2 pb-6 focus:outline-none md:py-6 h-screen">
          {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div> */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              <div className="rounded-lg h-96">
                <div className="mt-10 mx-auto max-w-screen-xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <img src={logo} alt="logo" />

                    <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-6xl">
                      {I18n.t('home.welcome')} <br className="xl:hidden" />
                      <span className="text-indigo-600">
                        {I18n.t('home.welcome_site')}
                      </span>
                    </h2>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      {I18n.t('home.tagline')}
                    </p>

                    <div className="mt-5 sm:mt-8 mb-8 sm:flex sm:justify-center lg:justify-start">
                      {canCreateApps && (
                        <div className="rounded-md shadow">
                          <Link
                            to="/apps/new"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-gray-900 hover:bg-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                          >
                            {I18n.t('home.create_new')}
                          </Link>
                        </div>
                      )}
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <a
                          href="https://dev.chaskiq.io"
                          target={'blank'}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:shadow-outline focus:border-indigo-300 transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
                        >
                          {I18n.t('home.go_to_doc')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <Badge variant="green" className="mb-3 ">
                  {I18n.t('common.your_apps')}
                </Badge>

                <div className="flex flex-wrap overflow-hidden sm:-mx-1 pb-20">
                  {apps.map((a) => (
                    <div
                      key={a.key}
                      className="lg:w-1/4 w-screen overflow-hidden-- my-1 px-1"
                    >
                      <Card
                        className={
                          'hover:bg-gray-100 border rounded overflow-hidden shadow-lg bg-white h-full'
                        }
                        title={<Link to={`/apps/${a.key}`}>{a.name}</Link>}
                        description={a.tagline}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Container>
  );
}

function mapStateToProps(state) {
  const { auth, app } = state;
  const { loading, isAuthenticated } = auth;

  return {
    app,
    loading,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(App));
