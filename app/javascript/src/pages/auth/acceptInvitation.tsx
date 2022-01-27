import React, { useState } from 'react';
import { connect } from 'react-redux';

import axios from 'axios';
import logo from '../../images/logo.png';
import queryString from 'query-string';

import Button from '@chaskiq/components/src/components/Button';
import TextField from '@chaskiq/components/src/components/forms/Input';
import Snackbar from '@chaskiq/components/src/components/Alert';

import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';

import { successAuthentication } from '@chaskiq/store/src/actions/auth';

declare global {
  interface Window {
    location: Location;
  }
}

function MadeWithLove() {
  return (
    <p className="mt-3 text-base text-gray-500 text-center">
      {I18n.t(`invitation.built_with_love`)}
      <a color="inherit" href="https://chaskiq.io/">
        Chaskiq
      </a>
    </p>
  );
}

function AcceptInvitation(props) {
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [token, _setToken] = useState(queryString.parse(props.location.search));
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put('/agents/invitation.json', {
        agent: {
          password: password,
          password_confirmation: passwordConfirmation,
          invitation_token: token.invitation_token,
        },
      })
      .then(function (response) {
        props.dispatch(
          successAuthentication(response.data.token, response.data.refreshToken)
        );
        props.dispatch(getCurrentUser());
        // use router redirect + snackbar status
        window.location.href = '/';
      })
      .catch(function (response) {
        setErrors(response.response.data.errors);
      });
  };

  const errorsFor = (name) => {
    console.log(errors);
    if (!errors[name]) {
      return null;
    }
    return errors[name].map((o) => o).join(', ');
  };

  return (
    <div>
      <div>
        <Snackbar />

        <img src={logo} className="mx-auto h-12 w-auto" alt="chaskiq logo" />

        <p className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
          {I18n.t(`invitation.title`)}
        </p>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form noValidate onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                required
                name="agent[password]"
                label={I18n.t(`invitation.password`)}
                type="password"
                id="password"
                autoFocus
                error={errorsFor('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={
                  errorsFor('password') ? (
                    <p id="component-error-text">{errorsFor('password')}</p>
                  ) : null
                }
              />

              <TextField
                variant="outlined"
                required
                name="agent[password_confirmation]"
                label={I18n.t(`invitation.password_confirmation`)}
                type="password"
                id="password_confirmation"
                autoComplete="current-password"
                error={errorsFor('password_confirmation')}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                helperText={
                  errorsFor('password_confirmation') ? (
                    <p id="component-error-text">
                      {errorsFor('password_confirmation')}
                    </p>
                  ) : null
                }
              />

              <Button type="submit" variant="contained" color="primary">
                {I18n.t(`invitation.button`)}
              </Button>
            </form>
          </div>

          <MadeWithLove />
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { auth, current_user } = state;
  const { loading, isAuthenticated } = auth;

  return {
    current_user,
    loading,
    isAuthenticated,
  };
}

export default connect(mapStateToProps)(AcceptInvitation);
