import graphql from '@chaskiq/store/src/graphql/client';

import { APP_PACKAGE_HOOK } from '@chaskiq/store/src/graphql/queries';

export function getPackage(data, location, cb) {
  // inbox, conversation, bla
  const mergedData = { ...data, ctx: { ...data.ctx, location: location } };
  graphql(APP_PACKAGE_HOOK, mergedData, {
    success: (data) => {
      cb && cb(data);
    },
    error: (error) => {
      console.log('error getting package', error);
    },
  });
}
