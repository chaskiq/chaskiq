import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Moment from 'react-moment'
import Accordeon from './Accordeon'
import Badge from './Badge'
import { compact } from 'lodash'

function UserProfileCard ({ app, app_user }) {
  function getPropertiesItems () {
    if (!app.customFields) return []
    const fields = app.customFields.map((field) => field.name)

    const items = fields.map((f) => {
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
    <div className="divide-y divide-gray-200">
      <div className="pb-6">
        <div className="bg-indigo-700 h-24 sm:h-20 lg:h-28" />
        <div className="-mt-12 flow-root px-4 space-y-6 sm:-mt-8 sm:flex sm:items-end sm:px-6 sm:space-x-6 lg:-mt-15">
          <div>
            <div className="-m-1 flex">
              <div className="inline-flex rounded-lg overflow-hidden border-4 border-white">
                <img className="flex-shrink-0 h-24 w-24 sm:h-40 sm:w-40 lg:w-48 lg:h-48"
                  src={app_user.avatarUrl}
                />
              </div>
            </div>
          </div>
          <div className="ml-3 sm:flex-1">
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="font-bold text-xl leading-7 text-gray-900 sm:text-2xl sm:leading-8">
                  {app_user.properties.name}
                </h3>
                {
                  app_user.online &&
                    <span aria-label="Online"
                      className="ml-2 bg-green-400 flex-shrink-0 inline-block h-2 w-2 rounded-full"
                    />
                }
              </div>
              <p className="text-sm leading-5 text-gray-500">
                {app_user.email}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap">
              <span className="flex-shrink-0 w-full inline-flex rounded-md shadow-sm sm:flex-1">
                <Link
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  to={`/apps/${app.key}/users/${app_user.id}`}>
                    show profile
                </Link>
              </span>
              {/* <span className="mt-3 flex-1 w-full inline-flex rounded-md shadow-sm sm:mt-0 sm:ml-3">
                <button type="button" className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150">
                  Call
                </button>
              </span> */}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-0 sm:py-0">
        <dl className="space-y-8 sm:space-y-0">
          <div className="sm:flex sm:space-x-6 sm:px-6 sm:py-5">
            <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
              Last seen
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
              <p>
                <Moment fromNow ago>
                  {Date.parse(app_user.lastVisitedAt)}
                </Moment>
              </p>
            </dd>
          </div>
          <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
            <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
              Location
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
              {[app_user.city, app_user.region, app_user.country].filter((o) => o).join(', ')}
            </dd>
          </div>

          <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
            <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
              Web Sessions
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
              {app_user.webSessions}
            </dd>
          </div>

          {
            app_user.timezone &&
            <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Timezone
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {app_user.timezone}
              </dd>
            </div>
          }

          { app_user.browser &&
            <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Browser
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {[app_user.browser, app_user.browserVersion].join(', ')}
              </dd>
            </div>
          }

          { app_user.os &&
            <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Operating System
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                {[app_user.os, app_user.osVersion].join(', ')}
              </dd>
            </div>
          }

          { app_user.tagList &&
            <div className="sm:flex sm:space-x-6 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
              <dt className="text-sm leading-5 font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Tags
              </dt>
              <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                { app_user.tagList.map((tag, i) => (<Badge size="sm" key={`tag-${i}`}> {tag} </Badge>))}
              </dd>
            </div>
          }

        </dl>
      </div>

      <Accordeon
        items={[
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
  )
}

function mapStateToProps (state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

export default withRouter(connect(mapStateToProps)(UserProfileCard))
