import React, { useRef } from 'react';
import { connect } from 'react-redux';

import { doSignout } from '@chaskiq/store/src/actions/auth';

import { clearCurrentUser } from '@chaskiq/store/src/actions/current_user';
import { useAuth0 } from '@auth0/auth0-react';

const LogOut = ({ dispatch }) => {
  const { logout } = useAuth0();

  React.useEffect(() => {
    dispatch(doSignout());
    dispatch(clearCurrentUser());
    logout({ returnTo: `${window.location.origin}?action=logout` });
  }, []);

  return (
    <div>
      <React.Fragment>logged out</React.Fragment>
    </div>
  );
};

function mapStateToProps(state) {
  const { auth, current_user, theme } = state;
  const { loading, isAuthenticated } = auth;
  return {
    current_user,
    loading,
    isAuthenticated,
  };
}

export default connect(mapStateToProps)(LogOut);
