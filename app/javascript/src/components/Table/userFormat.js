import React from 'react'
import Moment from 'react-moment'
import styled from '@emotion/styled'
import Badge from '../Badge'
import Avatar from '../Avatar'

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`

const AvatarWrapper = styled.div`
  margin-right: 8px;
`

function UserBadge (props) {
  const { row } = props
  return (
    <div color={row.online ? 'primary' : 'secondary'} variant="dot">
      <div name={row.email} size="medium" src={row.avatarUrl} />
    </div>
  )
}

const userFormat = function (showUserDrawer, app) {
  let opts = [
    // {field: 'id', title: 'id' },
    {
      field: 'name',
      title: 'Name',
      render: (row) => {
        return (
          row && (
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div
                onClick={(e) => showUserDrawer && showUserDrawer(row)}
                className="flex items-center"
              >
                <div className="flex-shrink-0 h-10 w-10">
                  
                  <Avatar 
                    size={'medium'} 
                    src={row.avatarUrl} 
                    indicator={row.online}
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
        )
      }
    },
    { field: 'email', title: 'Email', hidden: true },
    {
      field: 'state',
      title: 'State',
      render: (row) => {
        return (
          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">

            <Badge variant={
              row.state === 'subscribed' ? 'green' : 'yellow'
            }>
              {row.state}
            </Badge>

          </td>
        )
      }
    },
    { field: 'online', title: 'Online', hidden: true },
    { field: 'lat', title: 'Lat', hidden: true },
    { field: 'lng', title: 'Lng', hidden: true },
    { field: 'postal', title: 'Postal', hidden: true },
    { field: 'browserLanguage', title: 'Browser Language', hidden: true },
    { field: 'referrer', title: 'Referrer', hidden: true },
    { field: 'os', title: 'Os', hidden: true },
    { field: 'osVersion', title: 'Os Version', hidden: true },
    { field: 'lang', title: 'Lang', hidden: true },
    { field: 'webSessions', title: 'Web sessions' },
    { field: 'LastSeen', title: 'Last seen' },
    { field: 'FirstSeen', title: 'First seen' },

    {
      field: 'lastVisitedAt',
      title: 'Last visited at',
      render: (row) =>
        row && (
          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
            <Moment fromNow>{row.lastVisitedAt}</Moment>
          </td>
        )
    }
  ]

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
        )
    }))
    opts = opts.concat(other)
  }

  return opts
}

export default userFormat
