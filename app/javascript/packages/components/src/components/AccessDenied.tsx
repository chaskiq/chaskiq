import React from 'react';
import icon from '../../../../src/images/favicon.png';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { UNAUTHORIZED } from '@chaskiq/store/src/actions/status_messages';
import { clearCode } from '@chaskiq/store/src/actions/error_status_code';
import { useDispatch } from 'react-redux';

export function allowedAccessTo(app, section, verb = 'read') {
  const userRole = app.currentAppRole;

  if (!userRole) return null;
  if (userRole.owner) return true;
  const roleName = userRole.name;

  const role_definition = app.availableRoles[roleName];
  if (!role_definition) return null;
  const res =
    role_definition['manage']?.includes('all') ||
    role_definition['manage']?.includes(section) ||
    role_definition[verb]?.includes(section);

  console.log('PERMISSION CHECK FOR:', verb, section, res);
  return res;
  // you can disable this behavior by returning true
  //return true
}

function get(role_definition, role_name) {
  switch (role_definition[role_name]) {
    case null:
    case undefined:
      return [];
    default:
      return role_definition[role_name];
  }
}

function has_error(code) {
  return code === UNAUTHORIZED;
}

function RestrictedArea({
  app,
  current_user,
  verb,
  section,
  children,
  error_code,
}) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    return function cleanup() {
      dispatch(clearCode());
    };
  }, [verb, section, children]);

  return (
    <React.Fragment>
      {has_error(error_code) || !allowedAccessTo(app, section, verb) ? (
        <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-shrink-0 flex justify-center">
            <a href="/" className="inline-flex">
              <span className="sr-only">Chaskiq</span>
              <img className="h-12 w-auto" src={icon} alt="logo" />
            </a>
          </div>
          <div className="py-16">
            <div className="text-center">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                401 error
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                Access denied
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Sorry, you dont have access to this page.
              </p>
              <div className="mt-6">
                <a
                  href="/"
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Go back home<span aria-hidden="true"> →</span>
                </a>
              </div>
            </div>
          </div>
        </main>
      ) : (
        children
      )}
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { app, current_user, error_code } = state;

  return {
    current_user,
    app,
    error_code,
  };
}

export default withRouter(connect(mapStateToProps)(RestrictedArea));
