import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ContentHeader from '../components/PageHeader'
import Content from '../components/Content'
import { isEmpty } from 'lodash'
import Button from '../components/Button'
import Tabs from '../components/Tabs'
import CircularProgress from '../components/Progress'

import {
  setCurrentSection,
  setCurrentPage
} from '../actions/navigation'

import {
  clearSubscriptionState
} from '../actions/paddleSubscription'

import {
  PLANS,
  SUBSCRIPTION_TRANSACTIONS,
  SUBSCRIPTION_DETAILS,
  UPDATE_SUBSCRIPTION_PLAN
} from '../graphql/queries'

import graphql from '../graphql/client'

function Billing ({
  current_user,
  dispatch,
  paddleSubscription,
  app
}) {
  const [plans, setPlans] = React.useState([])
  const [openCheckout, setOpenCheckout] = React.useState(null)
  const [openSubscriptionUpdate, setOpenSubscriptionUpdate] = React.useState(null)
  const [subscriptionDetails, setSubscriptionDetails] = React.useState([])

  React.useEffect(() => {
    dispatch(setCurrentPage('Billing'))
    dispatch(setCurrentSection('Settings'))
    getPlans()
    getSubscriptionDetails()
  }, [])

  React.useEffect(() => {
    setOpenCheckout(null)
    setOpenSubscriptionUpdate(null)
    getSubscriptionDetails()
  }, [paddleSubscription.alert_name])

  function getPlans () {
    graphql(PLANS, {
      appKey: app.key
    }, {
      success: (data) => {
        setPlans(data.app.plans)
      },
      error: () => {
        debugger
      }
    })
  }

  function clearPaddleSubscription () {
    // TODO: clear
    dispatch(clearSubscriptionState())
  }

  function renderAlert () {
    switch (paddleSubscription.alert_name) {
      case 'subscription_updated':
        return <SucessModal
          options={paddleSubscription}
          handleClose={() => clearPaddleSubscription()}
        />
      case 'subscription_created':
        return <SucessModal
          options={paddleSubscription}
          handleClose={() => clearPaddleSubscription()}
        />
      case 'subscription_cancelled':
        return <FailureModal
          options={paddleSubscription}
          handleClose={() => clearPaddleSubscription()}
        />
      default:
        return null
    }
  }

  function openCheckoutHandler (plan) {
    subscription
      ? setOpenSubscriptionUpdate(plan)
      : setOpenCheckout(plan)
  }

  function getSubscriptionDetails () {
    graphql(SUBSCRIPTION_DETAILS, {
      appKey: app.key
    }, {
      success: (data) => {
        // will not set subscription if it's deleted
        setSubscriptionDetails(data.app.subscriptionDetails)
      },
      error: () => {
        debugger
      }
    })
  }

  function tabs () {
    /*
    <Plans plans={plans}
      currentPlan={subscriptionPlanId}
      appPlan={app.plan}
      openCheckout={(plan) => openCheckoutHandler(plan) }
    />
    */
    return [
      {
        label: I18n.t('subscriptions.tabs')[0],
        content: !isEmpty(plans) &&
          <PlanBoard
            plans={plans}
            openCheckout={(plan) => openCheckoutHandler(plan) }
            currentPlan={subscriptionPlanId}
            appPlan={app.plan}
          />
      },
      {
        label: I18n.t('subscriptions.tabs')[1],
        content: <Transactions app={app}/>
      }
    ]
  }

  function updatesubscription (planId) {
    graphql(UPDATE_SUBSCRIPTION_PLAN, {
      appKey: app.key,
      planId: planId
    }, {
      success: (data) => {
        data.app.updateSubscriptionPlan
        // debugger
      },
      error: () => {
        // debugger
      }
    })
  }

  function getPlanName () {
    if (!plans) return
    if (subscriptionDetails.length === 0) return

    const plan = plans.find((o) => o.id === subscriptionDetails[0].plan_id)
    return plan && plan.name
  }

  const subscription = subscriptionDetails[0]
  const subscriptionPlanId = subscription && subscription.plan_id

  return <div>
    <Content>
      <ContentHeader
        title={
          <div className="bg-gray-50">

            {
              subscription &&
                <div className="max-w-screen-xl mx-auto py-12 px-4
                                sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center
                                lg:justify-between">
                  <h2 className="text-3xl leading-9 font-extrabold tracking-tight
                                text-gray-900 sm:text-3xl sm:leading-10">
                    { I18n.t('subscriptions.billing_information.title')}
                    <br/>
                    <span className="text-indigo-600">
                      { I18n.t('subscriptions.billing_information.description', { plan_name: getPlanName() })}
                      <br/>
                      { subscription.next_payment &&
                        <span className="text-2xl text-gray-800">
                          {
                            I18n.t('subscriptions.billing_information.next_billing', {
                              next_payment_date: subscription.next_payment.date,
                              next_payment_amount: subscription.next_payment.amount,
                              next_payment_currency: subscription.next_payment.currency
                            }
                            )}
                        </span>
                      }

                      <br/>
                      { subscription &&
                        <span className="text-2xl text-gray-800">
                          { I18n.t('subscriptions.billing_information.subscription_state', { state: subscription.state }) }
                        </span>
                      }

                      <br/>
                      <span className="text-sm text-red-500 hover:text-gray-900">
                        <a href={subscription.cancel_url} target="blank">
                          { I18n.t('subscriptions.billing_information.cancel_plan')}
                        </a>
                      </span>
                    </span>
                  </h2>

                  <div className="mt-8 flex lg:flex-shrink-0 lg:mt-0">

                    <div className="inline-flex rounded-md shadow">
                      <a href={subscription.update_url}
                        className="inline-flex items-center justify-center
                        px-5 py-3 border border-transparent text-base
                        leading-6 font-medium rounded-md text-white
                        bg-indigo-600 hover:bg-indigo-500 focus:outline-none
                        focus:shadow-outline transition duration-150 ease-in-out">
                        { I18n.t('subscriptions.billing_information.update_payment_method')}
                      </a>
                    </div>
                  </div>
                </div>
            }
          </div>
        }
        // actions={}
      />

      <p>
        { /* JSON.stringify(paddleSubscription) */ }
        { /* JSON.stringify(subscriptionDetails) */ }
      </p>

      {
        !isEmpty(paddleSubscription) && renderAlert()
      }

      {
        openCheckout && <Checkout
          current_user={current_user}
          app={app}
          handleClose={() => setOpenCheckout(null)}
          handleSuccess={() => setOpenCheckout(null)}
          product={openCheckout}
        />
      }

      {
        openSubscriptionUpdate &&
          <UpdateSubscriptionModal
            subscription={subscription}
            handleClose={ () => setOpenSubscriptionUpdate(null)}
            handleSubmit={(planId) => updatesubscription(planId)}
            plan={openSubscriptionUpdate}
          />
      }

      <Tabs tabs={tabs()}></Tabs>

    </Content>

  </div>
}

function mapStateToProps (state) {
  const { auth, app, current_user, paddleSubscription } = state
  const { isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    current_user,
    isAuthenticated,
    paddleSubscription
  }
}

function SucessModal ({ options, handleClose }) {
  return (

    <div className="fixed bottom-0 inset-x-0 px-4 pb-6 sm:inset-0 sm:p-0 sm:flex sm:items-center sm:justify-center">

      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-sm sm:w-full sm:p-6"
        role="dialog" aria-modal="true" aria-labelledby="modal-headline">

        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            onClick={handleClose}
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
              { I18n.t(`subscriptions.alerts.${options.alert_name}.title`)}
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                { I18n.t(`subscriptions.alerts.${options.alert_name}.desc`)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <span className="flex w-full rounded-md shadow-sm">
            <button
              type="button"
              onClick={handleClose}>
              { I18n.t('subscriptions.alerts.close')}
            </button>
          </span>
        </div>
      </div>
    </div>

  )
}

function FailureModal ({ options, handleClose }) {
  return (
    <div className="fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center">

      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={handleClose}
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                { I18n.t(`subscriptions.alerts.${options.alert_name}.title`)}
              </h3>
              <div className="mt-2">
                <p className="text-sm leading-5 text-gray-500">
                  { I18n.t(`subscriptions.alerts.${options.alert_name}.desc`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UpdateSubscriptionModal ({ plan, subscription, handleSubmit, handleClose }) {
  const [loading, setLoading] = React.useState(false)

  function submit () {
    setLoading(true)
    handleSubmit(plan.id)
  }

  return (

    <div className="fixed bottom-0 inset-x-0 px-4 pb-6 sm:inset-0 sm:p-0 sm:flex sm:items-center sm:justify-center">

      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-sm sm:w-full sm:p-6"
        role="dialog" aria-modal="true" aria-labelledby="modal-headline">
        <div>
          <div className="mt-3 text-center sm:mt-5">

            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={handleClose}
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
              Update your subscription to <span className="font-bold">{plan.name}</span> plan
            </h3>

            {
              !loading &&
              plan.recurring_price.USD != '0.00' && <div className="mt-2">
                <p className="text-sm leading-5 text-gray-500">

                  {
                    <span
                      dangerouslySetInnerHTML={
                        {
                          __html: I18n.t('subscriptions.update_subscription.billed_on', {
                            billing_period: plan.billing_period,
                            billing_type: plan.billing_type
                          })
                        }
                      }/>
                  }

                  <br/>

                  {
                    <span
                      dangerouslySetInnerHTML={
                        {
                          __html: I18n.t('subscriptions.update_subscription.amount', {
                            recurring_price: plan.recurring_price.USD
                          })
                        }
                      }/>
                  }

                  <br/>

                  { subscription.next_payment &&
                    <span
                      dangerouslySetInnerHTML={
                        {
                          __html: I18n.t('subscriptions.update_subscription.next_payment', {
                            next_payment_date: subscription.next_payment.date
                          })
                        }
                      }/>
                  }
                </p>
              </div>
            }

            {
              loading &&
              <CircularProgress/>
            }
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <span className="flex w-full rounded-md shadow-sm">
            <button
              disabled={loading}
              onClick={submit}
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5">
              { I18n.t('subscriptions.update_subscription.cta')}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

function Plans ({ plans, openCheckout, currentPlan, appPlan }) {
  return (
    plans.filter((o) => o.id !== currentPlan)
      .map((o) => <div
        key={`plan-key-${o.id}`}
        className="pt-4">
        <Plan
          key={`plan-key-${o.id}`}
          plan={o}
          appPlan={appPlan}
          currentPlan={currentPlan}
          openCheckout={openCheckout}
        />
      </div>
      )
  )
}

function Plan ({ plan, openCheckout, currentPlan, appPlan }) {
  function findInTranslation () {
    const translatedPlan = I18n.t('subscriptions.plans').find((o) => o.id === plan)
    return translatedPlan && translatedPlan
  }

  return (
    <div className={`${appPlan.id === plan.id ? 'bg-gray-100' : ''} border rounded-md shadow-lg flex mb-4`}>
      <div className="p-5 flex-grow">
        <h2 className="text-4xl font-extrabold">{plan.name}</h2>
        <p className="text-gray-600">
          {findInTranslation() && findInTranslation().description }
        </p>

        <div>
          <div className="flex items-center my-4">
            <span className="mr-2 font-bold text-md uppercase">
              {I18n.t('subscriptions.plan.included')}
            </span>
            <div className="ml-2 h-1 bg-gray-200 flex-grow"/>
          </div>

          <dl className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
            {
              // findInTranslation() && findInTranslation()
              plan.features.filter((o) => o.active).map((o, index) => (
                <div key={`items-${index}`} className="sm:col-span-1">
                  <dt className="text-sm leading-5 font-medium text-gray-500">
                    <div className="flex">
                      <div className="mr-1 flex items-center justify-center h-4 w-4 rounded-full bg-green-100">
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span>{I18n.t(`subscriptions.features.${o.name}.title`)}</span>
                    </div>
                  </dt>
                </div>
              ))
            }

          </dl>

        </div>
      </div>

      <div className="bg-gray-100 p-5 text-center flex flex-col items-center justify-center">
        <p className="font-bold text-lg">
          {I18n.t('subscriptions.plan.pay_by', { billing_type: plan.billing_type })}
        </p>
        <h2 className="flex justify-center items-center my-4">
          <span className="mr-2 text-3xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-5xl">
            $ {plan.recurring_price.USD}
          </span>
          <span className="text-2xl text-gray-300">USD</span>
        </h2>
        {
          plan.trial_days !== 0 &&
            <p dangerouslySetInnerHTML={
              {
                __html: I18n.t('subscriptions.plan.trial_days', { trial_days: plan.trial_days })
              }
            }>
            </p>
        }
        <Button
          className="my-4"
          size="large"
          onClick={() => openCheckout(plan)}>
          { I18n.t('subscriptions.plan.get_access') }
        </Button>
      </div>
    </div>
  )
}

function Checkout ({ current_user, app, product, handleSuccess, handleClose }) {
  React.useEffect(() => {
    Paddle.Setup({
      vendor: 115475 // Replace with your Vendor ID.
    })

    Paddle.Checkout.open({
      method: 'inline',
      email: current_user.email,
      product: product.id, // Replace with your Product or Plan ID
      allowQuantity: false,
      disableLogout: true,
      passthrough: app.key,
      frameTarget: 'checkout-container', // The className of your checkout <div>
      frameInitialHeight: 366,
      frameStyle: 'width:100%; background-color: transparent; border: none;',
      successCallback: (info) => { handleSuccess() }
    })
  }, [])

  return (
    <div>
      <div className="fixed bottom-0 inset-x-0 px-4 pb-6 sm:inset-0 sm:p-0 sm:flex sm:items-center sm:justify-center">

        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-sm sm:w-full sm:p-6"
          role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div>
            <div className="mt-3 text-center sm:mt-5">

              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={handleClose}
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                >
                  <svg
                    className="h-6 w-6"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="checkout-container"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Transactions ({ app }) {
  const [transactions, setTransactions] = React.useState([])

  function getTransactions () {
    graphql(SUBSCRIPTION_TRANSACTIONS, {
      appKey: app.key
    }, {
      success: (data) => {
        setTransactions(data.app.subscriptionTransactions)
      },
      errors: () => {
        debugger
      }
    })
  }

  React.useEffect(() => {
    getTransactions()
  }, [])

  return (
    <div className="pt-4">

      <table className="min-w-full">
        <thead>
          <tr className="border-t border-gray-200">
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              <span className="lg:pl-2">Status</span>
            </th>
            <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Receipt
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">

          {
            transactions.map((o) => (
              <tr key={`trx-${o.order_id}`}>
                <td className="px-6 py-3 max-w-0 w-full whitespace-nowrap text-sm leading-5 font-medium text-gray-900">
                  <div className="flex items-center space-x-3 lg:pl-2">
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-pink-600" />
                    <a href="#" className="truncate hover:text-gray-600">
                      {o.status}
                      {/* <span>
                          GraphQL API <span className="text-gray-500 font-normal">
                          in Engineering</span>
                        </span>
                      */}
                    </a>
                  </div>
                </td>

                <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm leading-5 text-gray-500 text-right">
                  {o.created_at}
                </td>

                <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm leading-5 text-gray-500 text-right">
                  ${o.amount} {o.currency}
                </td>

                <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm leading-5 text-gray-500 text-right">
                  <a href={o.receipt_url} target="blank">
                    Download receipt
                  </a>
                </td>
              </tr>
            ))
          }

        </tbody>
      </table>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Billing))

function PlanBoard ({ appPlan, plans, openCheckout }) {
  return <div className="max-w-2xl mx-auto bg-white py-16 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">

    {/* xs to lg */}
    <div className="space-y-24 lg:hidden">
      {
        plans.map((plan) => (
          <div key={`mobile-plan-${plan.id}`}>
            <div className="px-4">
              <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${Math.floor(plan.recurring_price.USD)}
                </span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>

              {
                appPlan && appPlan.id === plan.id &&
                <p className="mt-4 text-sm text-gray-500">
                  This is your current plan
                </p>
              }
              
              {
                !appPlan || appPlan.id != plan.id &&
                <button
                  className={`
                  bg-green-400 
                  text-white
                  hover:bg-green-500 
                  focus:outline-none 
                  focus:border-green-700 
                  focus:shadow-outline
                  mt-6 block w-full border border-transparent rounded-md shadow py-2 text-sm font-semibold text-white text-center`}
                  onClick={() => openCheckout(plan)}> Buy {plan.name}
                </button>
              }
            </div>
            <table className="mt-8 w-full">
              <caption className="bg-gray-50 border-t border-gray-200 py-3 px-4 text-sm font-medium text-gray-900 text-left">
                Features
              </caption>
              <thead>
                <tr>
                  <th className="sr-only" scope="col">Feature</th>
                  <th className="sr-only" scope="col">Included</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">

                {
                  Object.keys(I18n.t('subscriptions.features'))
                    .map((k) => (
                      <tr key={`mobile-feature-${k}`}
                        className="border-t border-gray-200">
                        <th className="py-5 px-4 text-sm font-normal text-gray-500 text-left" scope="row">
                          {I18n.t(`subscriptions.features.${k}.title`)}
                        </th>
                        <td className="py-5 pr-4">
                          {
                            plan.features.find((p) => p.active && p.name === k) &&
                          <svg className="ml-auto h-5 w-5 text-green-500" x-description="Heroicon name: check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          }

                          {
                            plan.features.find((p) => p.active && p.name === k) &&
                          <span className="sr-only">Yes</span>
                          }

                        </td>
                      </tr>
                    ))
                }

              </tbody>
            </table>
            <div className="border-t border-gray-200 px-4 pt-5">
              <button
                className={`
                bg-green-400 
                text-white
                hover:bg-green-500 
                focus:outline-none 
                focus:border-green-700 
                focus:shadow-outline
                mt-6 block w-full border border-transparent rounded-md shadow py-2 text-sm font-semibold text-white text-center`}
                onClick={() => openCheckout(plan)}> Buy {plan.name}
              </button>
              {/* <a href="#" className="block w-full bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-md shadow py-2 text-sm font-semibold text-white text-center hover:to-pink-600">
                Buy Basic
              </a> */}
            </div>
          </div>
        ))
      }

    </div>
    {/* lg+ */}
    <div className="hidden lg:block">
      <table className="w-full h-px table-fixed">
        <caption className="sr-only">
          Pricing plan comparison
        </caption>
        <thead>
          <tr>
            <th className="pb-4 pl-6 pr-6 text-sm font-medium text-gray-900 text-left" scope="col">
              <span className="sr-only">Feature by</span>
              <span>Plans</span>
            </th>
            {
              plans.map((o) =>
                <th key={`plan-${o.id}`}
                  className="w-1/4 pb-4 px-6 text-lg leading-6 font-medium text-gray-900 text-left"
                  scope="col">
                  {o.name}
                </th>
              )
            }
          </tr>
        </thead>
        <tbody className="border-t border-gray-200 divide-y divide-gray-200">
          <tr>

            <th className="py-8 pl-6 pr-6 align-top text-sm font-medium text-gray-900 text-left" scope="row">Pricing</th>
            {
              plans.map((p) => (
                <td key={`lg-plans-${p.id}`}className="h-full py-8 px-6 align-top">
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <p>
                        <span className="text-4xl font-extrabold text-gray-900">
                          ${Math.floor(p.recurring_price.USD)}
                        </span>
                        <span className="text-base font-medium text-gray-500">/mo</span>
                      </p>
                      <p className="mt-4 text-sm text-gray-500">{p.description}</p>
                    </div>

                    {
                      appPlan && appPlan.id == p.id &&
                      <p className="mt-4 text-sm text-gray-500">
                        This is your current plan
                      </p>
                    }

                    {
                      !appPlan || appPlan.id != p.id &&
                      <button
                        className={`
                        bg-green-400 
                        text-white
                        hover:bg-green-500 
                        focus:outline-none 
                        focus:border-green-700 
                        focus:shadow-outline
                        mt-6 block w-full border border-transparent rounded-md shadow py-2 text-sm font-semibold text-white text-center`}
                        onClick={() => openCheckout(p)}> Buy {p.name}
                      </button>
                    }
                  </div>
                </td>
              ))
            }
          </tr>
          <tr>
            <th className="py-3 pl-6 bg-gray-50 text-sm font-medium text-gray-900 text-left" colSpan={4} scope="colgroup">Features</th>
          </tr>

          {
            Object.keys(I18n.t('subscriptions.features')).map((k) => (
              <tr key={`plan-feature-matrix-${k}`}>
                <th className="py-5 pl-6 pr-6 text-sm font-normal text-gray-500 text-left" scope="row">
                  {I18n.t(`subscriptions.features.${k}.title`)}
                </th>

                {
                  plans.map((plan) => (
                    <td className="py-5 px-6">
                      {
                        plan.features.find(o => o.name === k && o.active) &&
                        <svg className="h-5 w-5 text-green-500" x-description="Heroicon name: check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      }
                      <span className="sr-only">Included in {plan.name}</span>
                    </td>
                  ))
                }
              </tr>
            ))
          }

        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <th className="sr-only" scope="row">Choose your plan</th>
            {
              plans.map((p) => (
                <td key={`lg-bottom-plan-${p.id}`} className="pt-5 px-6">

                  {
                    appPlan && appPlan.id == p.id &&
                    <p className="mt-4 text-sm text-gray-500">
                      This is your current plan
                    </p>
                  }

                  { !appPlan || appPlan.id != p.id &&
                  <button
                    className={`
                    bg-green-400 
                    text-white
                    hover:bg-green-500 
                    focus:outline-none 
                    focus:border-green-700 
                    focus:shadow-outline
                    mt-6 block w-full border border-transparent rounded-md shadow py-2 text-sm font-semibold text-white text-center`}
                    onClick={() => openCheckout(plan)}> Buy {p.name}
                  </button>}
                </td>
              ))
            }
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
}
