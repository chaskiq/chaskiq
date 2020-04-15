/* eslint-disable no-script-url */

import React from "react";
// import Link from '@material-ui/core/Link';
// import { makeStyles } from '@material-ui/core/styles';
// import p from '@material-ui/core/p';
import moment from "moment";

export default function Count({ data, label, appendLabel, subtitle }) {
  return (
    <React.Fragment>
      <p className="text-lg leading-6 font-medium text-gray-900">{label}</p>

      <p
        className="mt-1 text-3xl leading-9 font-semibold text-gray-900"
        component="p"
        variant="h4"
      >
        {data || 0} {appendLabel}
      </p>

      <p
        className="mt-1 max-w-2xl text-sm leading-5 text-gray-500"
        color="textSecondary"
        variant={"caption"}
      >
        {subtitle || moment().format("LL")}
      </p>
      {/* <div>
        <Link color="primary" href="javascript:;">
          View Data
        </Link>
      </div> */}
    </React.Fragment>
  );
}
