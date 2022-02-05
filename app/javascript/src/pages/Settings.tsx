import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import I18n from '../shared/FakeI18n';

import Content from '@chaskiq/components/src/components/Content';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import { updateApp } from '@chaskiq/store/src/actions/app';

import { APP } from '@chaskiq/store/src/graphql/queries';
import { CREATE_DIRECT_UPLOAD } from '@chaskiq/store/src/graphql/mutations';
import settingsItems from '../layout/settingsItems';
type AppSettingsContainerProps = {
  dispatch: (value: any) => void;
  match: any;
  currentUser: any;
  classes: string;
  app: any;
};
function AppSettingsContainer({ app, dispatch }) {
  const items = settingsItems(app, () => false);
  React.useEffect(() => {
    dispatch(setCurrentPage('app_settings'));
    dispatch(setCurrentSection('Settings'));
  }, []);

  return (
    <Content>
      {app && (
        <React.Fragment>
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {I18n.t('settings.app.app_settings')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {/* some subtitle here? */}
            </p>
            <ul
              role="list"
              className="mt-6 border-t border-b border-gray-200 py-6 grid grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {items.map((item) => (
                <li className="flow-root">
                  <div className="relative -m-2 p-2 flex items-center space-x-4 rounded-xl hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
                    <div className="text-white flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg bg-black">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link to={item.url} className="focus:outline-none">
                          <span
                            className="absolute inset-0"
                            aria-hidden="true"
                          ></span>
                          {item.label}
                          <span aria-hidden="true"> &rarr;</span>
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500"></p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </React.Fragment>
      )}
    </Content>
  );
}

function mapStateToProps(state) {
  const { app, navigation } = state;
  const { current_section } = navigation;
  return {
    app,
    current_section,
  };
}

export default withRouter(connect(mapStateToProps)(AppSettingsContainer));
