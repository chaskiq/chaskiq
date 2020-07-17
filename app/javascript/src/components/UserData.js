import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Moment from 'react-moment'
import Accordeon from './Accordeon'
import {compact} from 'lodash'

function UserData ({ app_user, app, disableAvatar }) {
  function getPropertiesItems () {

    const fields = app.customFields.map((field)=> field.name)

    const items = fields.map((f)=> {
      const val = app_user.properties[f]
      if (!val) return null
      return {
        label: `${f}:`,
        value: val
      }
    })

    return compact(items)
  }
  return (
    <React.Fragment>
      {app_user && app_user.id && (
        <div className="overflow-hidden max-w-xs my-3">
          {
            !disableAvatar && <div>
              <div className="flex justify-center mt-5">
                <img
                  src={app_user.avatarUrl}
                  className="rounded-full border-solid border-white border-2 -mt-3"
                />
              </div>

              <div className="text-center px-3 pb-6 pt-2">
                <h3 className="text-sm leading-5 font-medium text-gray-900 flex flex-col justify-center items-center">
                  {app_user.properties.name}

                  <span
                    className={`
                  ${
                    app_user.online
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                  px-2 inline-flex text-xs leading-5 font-semibold 
                  rounded-full`}
                  >
                    {app_user.online ? 'Online' : 'Offline'}
                  </span>
                </h3>

                <p className="text-sm leading-5 text-gray-500">
                  {app_user.email}
                </p>

                <Link
                  className="text-sm leading-5 font-medium text-gray-900"
                  to={`/apps/${app.key}/users/${app_user.id}`}
                >
                  show profile
                </Link>
              </div>
            </div>
          }

          <div className="bg-white shadow overflow-hidden">
            <ul>
              <li>
                <a
                  href="#"
                  className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 sm:mt-0">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            fill="currentColor"
                            viewdiv="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {app_user.properties.country}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 sm:mt-0">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewdiv="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          <Moment fromNow ago>
                            {Date.parse(app_user.lastVisitedAt)}
                          </Moment>
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <Accordeon
            items={[
              {
                name: 'Location',
                component: null,
                items: [
                  {
                    label: 'referrer',
                    value: app_user.referrer
                  },

                  {
                    label: 'city',
                    value: app_user.city
                  },

                  {
                    label: 'region',
                    value: app_user.region
                  },

                  {
                    label: 'country',
                    value: app_user.country
                  },

                  {
                    label: 'lat',
                    value: app_user.lat
                  },

                  {
                    label: 'lng',
                    value: app_user.lng
                  },
                  {
                    label: 'postal:',
                    value: app_user.postal
                  }
                ]
              },
              {
                name: 'Browsing Properties',
                component: null,
                items: [
                  {
                    label: 'web sessions:',
                    value: app_user.webSessions
                  },

                  {
                    label: 'timezone:',
                    value: app_user.timezone
                  },

                  {
                    label: 'browser version:',
                    value: app_user.browserVersion
                  },

                  {
                    label: 'browser:',
                    value: app_user.browser
                  },

                  {
                    label: 'os:',
                    value: app_user.os
                  },

                  {
                    label: 'os version:',
                    value: app_user.osVersion
                  }
                ]
              },
              {
                name: 'Properties',
                component: null,
                items: getPropertiesItems()
              },
              {
                name: 'External Profiles',
                component: (
                  <div>
                    <ul dense>
                      {app_user.externalProfiles &&
                        app_user.externalProfiles.map((o, i) => {
                          return (
                            <div
                              m={2}
                              key={`app-user-profile-${app_user.id}-${o.id}`}
                            >
                              <div
                                className="flex flex-col"
                              >
                                <div className="flex flex-col">
                                  <p className="font-bold">
                                    {o.provider}
                                  </p>
                                  <p variant="h6">{o.profileId}</p>
                                </div>

                                {/* <Button
                                  size="small"
                                  variant={'outlined'}
                                  className="w-24"
                                  onClick={() => this.syncExternalProfile(o)}
                                >
                                  sync
                                </Button> */}
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  textAlign: 'left'
                                }}
                              >
                                {o.data && Object.keys(o.data).map((a, i) => {
                                  if (
                                    !o.data[a] ||
                                    typeof o.data[a] === 'object'
                                  ) { return null }
                                  return (
                                    <p
                                      variant={'caption'}
                                      key={`app-user-${o.provider}-${app_user.id}-${i}`}
                                    >
                                      {<b>{a}:</b>}
                                      {` ${o.data[a]}`}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                    </ul>
                  </div>
                )
              }
            ]}
          />
        </div>
      )}
    </React.Fragment>
  )
}

function mapStateToProps (state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

export default withRouter(connect(mapStateToProps)(UserData))
