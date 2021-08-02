import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import WebSetup from '@chaskiq/components/src/components/webSetup'
import Badge from '@chaskiq/components/src/components/Badge'

import Content from '@chaskiq/components/src/components/Content'
import PageHeader from '@chaskiq/components/src/components/PageHeader'

import DashboardItem from './reports/ReportItem'

import {
  MoreIcon,
  WebhooksIcon,
  ApiIcon,
  DashboardIcon,
  PlatformIcon,
  ConversationChatIcon,
  AssignmentIcon,
  CampaignsIcon,
  MailingIcon,
  AutoMessages,
  BannersIcon,
  ToursIcon,
  BotIcon,
  OutboundIcon,
  NewconversationIcon,
  SettingsIcon,
  HelpCenterIcon,
  ArticlesIcon,
  CollectionsIcon,
  ChatIcon,
  BillingIcon,
  IntegrationsIcon,
  TeamIcon,
  MessengerIcon,
  AppSettingsIcon,
  ChartsIcons,
} from '@chaskiq/components/src/components/icons'

import {
  setCurrentSection,
  setCurrentPage
} from '@chaskiq/store/src/actions/navigation'

export function Home() {
  return (
    <div>
      <PageHeader title={'Dashboard'} />
    </div>
  )
}

function Dashboard(props) {
  const { app, dispatch } = props

  React.useEffect(() => {
    dispatch(setCurrentSection(null))
    dispatch(setCurrentPage(null))
  }, [])


  const actions = [
    {
      title:  I18n.t('navigator.conversations'),
      href: `/apps/${app.key}/conversations`,
      icon: ConversationChatIcon,
      iconForeground: 'text-sky-700',
      iconBackground: 'bg-sky-50',
      render: ()=>(
        <div className="mt-2 text-sm text-gray-500">
          <span className="truncate--">
          {I18n.t('dashboard.status')}{' '}
          {app.activeMessenger && (
            <Badge size="sm" variant="green">
              {I18n.t('dashboard.status_running')}
            </Badge>
          )}
          {!app.activeMessenger && (
            <Badge size="sm" variant="gray">
              {I18n.t('dashboard.status_paused')}
            </Badge>
          )}
        </span>

        </div>
      )
    },
    {
      title: 'Reports',
      href: `/apps/${app.key}/reports`,
      icon: ChartsIcons,
      iconForeground: 'text-purple-700',
      iconBackground: 'bg-purple-50',
    },
    {
      title: I18n.t('navigator.childs.messenger_settings'),
      href: `/apps/${app.key}/messenger`,
      icon: AppSettingsIcon,
      iconForeground: 'text-teal-700',
      iconBackground: 'bg-teal-50',
    },
    {
      title: I18n.t('navigator.childs.app_settings'),
      href: `/apps/${app.key}/settings`,
      icon: SettingsIcon,
      iconForeground: 'text-teal-700',
      iconBackground: 'bg-teal-50',
    },
    {
      title: I18n.t('navigator.campaigns'),
      href: `/apps/${app.key}/campaigns`,
      icon: CampaignsIcon,
      iconForeground: 'text-sky-700',
      iconBackground: 'bg-sky-50',
    },
    {
      title: I18n.t('dashboard.guides'),
      externalLink: 'https://dev.chaskiq.io',
      icon: HelpCenterIcon,
      iconForeground: 'text-sky-700',
      iconBackground: 'bg-sky-50',
      text: I18n.t('navigator.help_center')
    }
  ]

  return (
    <div>
      <Content>
        
        <div key={'dashboard-hey'} className="space-y-2">
          <p
            className="text-4xl leading-2 text-gray-900 dark:text-gray-100 font-bold"
            dangerouslySetInnerHTML={{
              __html: I18n.t('dashboard.hey', {
                name: app.name,
              }),
            }}
          />

          <WebSetup />
          
        </div>
    
        <div key={'dashboard-status'} className="space-y-2">
          {/*<div
            className="mt-1 space-y-1"
            aria-labelledby="projects-headline"
          >
            {app.plan.name && (
              <Link
                to={`/apps/${app.key}/billing`}
                className="group flex items-center py-2 text-sm font-medium text-gray-600 dark:text-gray-100 rounded-md hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-black"
              >
                <span className="truncate">
                  Plan:{' '}
                  <Badge size="sm" variant="pink">
                    {app.plan.name}
                  </Badge>
                </span>
              </Link>
            )}
            </div>*/}

          <Example actions={actions}/>
        </div>

      </Content>
    </div>
  )
}

function mapStateToProps(state) {
  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated,
  }
}

export default withRouter(connect(mapStateToProps)(Dashboard))

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Example({actions}) {
  return (
    <div className="mt-5 rounded-lg bg-gray-200 overflow-hidden shadow divide-y divide-gray-200 sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-px">
      {actions.map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames(
            actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
            actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
            actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
            actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
            'relative group bg-white dark:bg-black dark:border-gray-900 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'
          )}
        >
          <div>
            {action.icon && <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                'rounded-lg inline-flex p-3 ring-4 ring-white'
              )}
            >
              <action.icon className="h-6 w-6" aria-hidden="true" />
            </span>}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              {
                !action.externalLink && 
                <Link to={action.href} className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </Link>
              }

              {
                action.externalLink && 
                <a href={action.externalLink} 
                  rel="noopener noreferrer"
                  className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.title}
                </a>
              }
            </h3>

            {
              action.render && action.render()
            }

            { action.text && 
              <p className="mt-2 text-sm text-gray-500">
                {action.text}
              </p>
            }
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  )
}