import React from "react";
import Moment from "react-moment";
import styled from "@emotion/styled";

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

function UserBadge(props) {
  const { row } = props;
  return (
    <div color={row.online ? "primary" : "secondary"} variant="dot">
      <div name={row.email} size="medium" src={row.avatarUrl} />
    </div>
  );
}

const userFormat = function (showUserDrawer, app) {
  let opts = [
    // {field: 'id', title: 'id' },
    {
      field: "email",
      title: "Name",
      render: (row) => {
        return (
          row && (
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div
                onClick={(e) => showUserDrawer && showUserDrawer(row)}
                className="flex items-center"
              >
                <div className="flex-shrink-0 h-10 w-10">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={row.avatarUrl}
                    alt=""
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm leading-5 font-medium text-gray-900">
                    {row.displayName}
                  </div>
                  <div className="text-sm leading-5 text-gray-500">
                    {row.email}
                  </div>
                </div>
              </div>
            </td>
          )
        );
      },
    },
    { field: "email", title: "email", hidden: true },
    {
      field: "state",
      title: "state",
      render: (row) => {
        return (
          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  row.state === "subscribed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
            >
              {row.state}
            </span>
          </td>
        );
      },
    },
    { field: "online", title: "online", hidden: true },
    { field: "lat", title: "lat", hidden: true },
    { field: "lng", title: "lng", hidden: true },
    { field: "postal", title: "postal", hidden: true },
    { field: "browserLanguage", title: "browser Language", hidden: true },
    { field: "referrer", title: "referrer", hidden: true },
    { field: "os", title: "os", hidden: true },
    { field: "osVersion", title: "os Version", hidden: true },
    { field: "lang", title: "lang", hidden: true },
    { field: "webSessions", title: "Web sessions" },
    { field: "LastSeen", title: "Last seen" },
    { field: "FirstSeen", title: "First seen" },

    {
      field: "lastVisitedAt",
      title: "last visited at",
      render: (row) =>
        row && (
          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
            <Moment fromNow>{row.lastVisitedAt}</Moment>
          </td>
        ),
    },
  ];

  if (app.customFields && app.customFields.length > 0) {
    const other = app.customFields.map((o) => ({
      hidden: true,
      field: o.name,
      title: o.name,
      render: (row) =>
        row && (
          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
            {row.properties[o.name]}
          </td>
        ),
    }));
    opts = opts.concat(other);
  }

  return opts;
};

export default userFormat;

// function mapStateToProps(state) {
//  const { app } = state
//  return {
//    app
//  }
// }
//
// export default connect(mapStateToProps)(userFormat)
