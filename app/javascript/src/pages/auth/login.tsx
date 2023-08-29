import React, { useRef } from 'react';
import { connect } from 'react-redux';

import logo from '../../images/logo.png';
import serialize from 'form-serialize';

import {
  authenticate,
  doSignout,
  authenticateFromAuth0,
  startAuthentication,
} from '@chaskiq/store/src/actions/auth';

import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';

import I18n from '../../shared/FakeI18n';

import { useAuth0 } from '@auth0/auth0-react';
import CircularIndeterminate from '@chaskiq/components/src/components/Progress';

const Auth0Login = ({ dispatch, domain, currentUser, loading }) => {
  const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [userMetadata, setUserMetadata] = React.useState(null);

  React.useEffect(() => {
    const getUserMetadata = async () => {
      if (!domain) {
        console.log('No DOMAIN ON AUTH0');
        return null;
      }

      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: 'read:current_user offline_access',
          ignoreCache: true,
          detailedResponse: false,
        });

        let refreshToken = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.includes('auth0')) {
            refreshToken = JSON.parse(localStorage.getItem(key))?.body
              ?.refresh_token;
          }
        }

        // console.log(accessToken, user);

        if (!user) {
          console.log('no user');
          return;
        }

        dispatch(startAuthentication());

        dispatch(
          authenticateFromAuth0(accessToken, refreshToken, () => {
            console.log('LOGGED IN!');
            dispatch(getCurrentUser());
          })
        );

        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { user_metadata } = await metadataResponse.json();

        setUserMetadata(setUserMetadata);
        console.log(user_metadata);

        setUserMetadata(user_metadata);
      } catch (e) {
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  return (
    <div>
      {domain && isAuthenticated && (
        <React.Fragment>
          <div className="flex items-center space-x-2 m-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.picture}
                  alt=""
                />
                <span
                  className="absolute inset-0 rounded-full shadow-inner"
                  aria-hidden="true"
                ></span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm font-medium text-gray-500">{user.email}</p>
            </div>
          </div>

          {/*<div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>{user.sub}</p>
            <h3>User Metadata</h3>
            {userMetadata ? (
              <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
            ) : (
              "No user metadata defined"
            )}
            </div>*/}
        </React.Fragment>
      )}

      {loading && <CircularIndeterminate size={16} />}

      {domain && (!isAuthenticated || (!currentUser?.id && !loading)) && (
        <LoginButton dispatch={dispatch} />
      )}
    </div>
  );
};

const LoginButton = ({ dispatch }) => {
  const { loginWithRedirect } = useAuth0();

  function handleRedirect() {
    dispatch(startAuthentication());
    loginWithRedirect();
  }

  return (
    <button
      onClick={handleRedirect}
      type="submit"
      className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
    >
      {I18n.t('login.sign_in')}
    </button>
  );
};

function Login({ dispatch, current_user, loading }) {
  const form = useRef(null);

  //@ts-ignore
  const auth0Domain = document.querySelector(
    'meta[name="auth0-domain"]'
  )?.content;

  function handleSubmit(e) {
    e.preventDefault();

    dispatch(doSignout());

    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    const { email, password } = serializedData; // this.state
    dispatch(
      authenticate(email, password, () => {
        getUser();
      })
    );
  }

  function getUser() {
    dispatch(getCurrentUser());
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-20 w-auto" src={logo} alt="Chaskiq" />
        <h2 className="mt-6 text-center text-1xl leading-3 font-light text-gray-400">
          {I18n.t('login.title')}
        </h2>

        {/* <p className="mt-2 text-center text-sm leading-5 text-gray-600 max-w">
          Or {' '}
          <a
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            start your 14-day free trial
          </a>
        </p> */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!auth0Domain && (
            <form action="#" ref={form} method="POST" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  {I18n.t('login.email')}
                </label>
                <div className="mt-1 rounded-md shadow-sm">
                  <input
                    id="email"
                    type="email"
                    name={'email'}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  {I18n.t('login.password')}
                </label>
                <div className="mt-1 rounded-md shadow-sm">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <label
                    htmlFor="remember_me"
                    className="ml-2 block text-sm leading-5 text-gray-900"
                  >
                    {I18n.t('login.remember_me')}
                  </label>
                </div>

                <div className="text-sm leading-5">
                  <a
                    href="/agents/password/new"
                    className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                  >
                    {I18n.t('login.forgot_password')}
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                  >
                    {I18n.t('login.sign_in')}
                  </button>
                </span>
              </div>
            </form>
          )}

          {auth0Domain && (
            <Auth0Login
              dispatch={dispatch}
              domain={auth0Domain}
              currentUser={current_user}
              loading={loading}
            />
          )}

          <div className="mt-6 hidden">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm leading-5">
                <span className="px-2 bg-white text-gray-500">
                  {I18n.t('login.continue_with')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <span className="w-full inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
                  >
                    <svg
                      className="h-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              </div>

              <div>
                <span className="w-full inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
                  >
                    <svg
                      className="h-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                </span>
              </div>

              <div>
                <span className="w-full inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
                  >
                    <svg
                      className="h-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { auth, current_user, theme } = state;
  const { loading, isAuthenticated } = auth;

  return {
    current_user,
    loading,
    isAuthenticated,
    theme,
  };
}

export default connect(mapStateToProps)(Login);
