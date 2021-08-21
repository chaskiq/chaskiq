/* eslint-disable no-script-url */

import React from 'react';
import moment from 'moment';

export default function Count({ data, label, appendLabel, subtitle }) {
  return (
    <React.Fragment>
      <div className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 truncate">
        {label}
      </div>

      <div className="mt-1 text-3xl leading-9 font-semibold text-gray-900 dark:text-gray-100">
        {data || 0} {appendLabel}
      </div>

      {subtitle && (
        <div className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
          {subtitle || moment().format('LL')}
        </div>
      )}
      {/* <div>
        <Link color="primary" href="javascript:;">
          View Data
        </Link>
      </div> */}
    </React.Fragment>
  );
}
