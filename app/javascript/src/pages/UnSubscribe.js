import React from 'react'
import graphql from '../graphql/client'
import Button from '../components/Button'
import CircularProgress from '../components/Progress'
import I18n from '../shared/FakeI18n'

import {
  CAMPAIGN_SUBSCRIPTION_TOGGLE
} from '../graphql/queries'

export default function UnSubscribe ({ match }) {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState({})

  React.useEffect(() => {
    toggleSubscription()
  }, [])

  function reSubscribe () {
    toggleSubscription(true)
  }

  function subscribe () {
    toggleSubscription(false)
  }

  function toggleSubscription (op = false) {
    setLoading(true)
    graphql(CAMPAIGN_SUBSCRIPTION_TOGGLE, {
      encoded: match.params.subscriber,
      op: op
    }, {
      success: (data) => {
        setLoading(false)
        setData(data.campaignSubscriptionToggle)
      },
      error: () => {
        console.log('errorroor')
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 bg-gray-100 h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">

              {
                loading && <CircularProgress/>
              }

              {
                !loading &&
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {I18n.t("campaign.unsubscribe.status", {state: data.state})}
                  </h3>
                  <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">

                    {
                      data.state === 'unsubscribed' && <p>
                      {I18n.t("campaign.unsubscribe.success", {email: data.email })}
                      <Button
                          onClick={reSubscribe}
                          className="ml-4 my-3"
                          size="small">
                          { I18n.t("campaign.unsubscribe.resubscribe") }
                        </Button>
                      </p>
                    }

                    {
                      data.state === 'subscribed' && <p>
                        <Button
                          onClick={subscribe}
                          className="ml-4 my-3"
                          size="small">
                          {I18n.t("campaign.unsubscribe.cancel")}
                        </Button>
                      </p>
                    }
                  </div>

                  {/*
                    <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                    <span className="inline-flex rounded-md shadow-sm">
                      <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150">
                      </button>
                    </span>
                    </div>
                  */}

                  {/* <div>
                    <p>If you have a moment, why did you unsubscribe from this sender?</p>

                    <ul>
                      <li>I am not interested in these emails</li>
                      <li>I never opted-in</li>
                      <li>The emails are spam</li>
                      <li>Other (fill in a reason below)</li>
                    </ul>
                  </div> */}
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
