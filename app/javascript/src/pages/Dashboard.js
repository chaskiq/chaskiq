import React from 'react'
import PageHeader from '../components/PageHeader'
import Progress from '../components/Progress'
import moment from 'moment'
import HeatMap from '../components/charts/heatMap'
import Pie from '../components/charts/pie'
import Count from '../components/charts/count'
import DashboardCard from '../components/dashboard/card'
import { DASHBOARD } from '../graphql/queries'
import graphql from '../graphql/client'
import { setCurrentSection } from '../actions/navigation'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Content from '../components/Content'
import I18n from '../shared/FakeI18n'

export function Home () {
  return (
    <div>
      <PageHeader title={'Dashboard'} />
    </div>
  )
}

function Dashboard (props) {
  const { app, dispatch } = props

  React.useEffect(() => {
    dispatch(setCurrentSection('Dashboard'))
  }, [])

  const initialData = {
    loading: true,
    from: moment().add(-1, 'week'),
    to: moment() // .add(-1, 'day')
  }

  const [dashboard, setDashboard] = React.useState(initialData)

  const bull = <span>•</span>

  return (
    <div>
      <Content>
        <div>
          <div className="flex flex-wrap -mx-4">
            <div className={'w-full p-4'}>
              <DashboardItem
                chartType={'app_packages'}
                dashboard={dashboard}
                app={app}
                label={I18n.t('dashboasrd.user_country')}
                kind={'app_packages'}
                // classes={classes}
                styles={{}}
              />
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardItem
                  chartType={'count'}
                  dashboard={dashboard}
                  app={app}
                  kind={'first_response_time'}
                  label={I18n.t('dashboard.response_avg')}
                  appendLabel={'Hrs'}
                />
              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardItem
                  chartType={'count'}
                  dashboard={dashboard}
                  app={app}
                  kind={'opened_conversations'}
                  label={I18n.t('dashboard.new_conversations')}
                  appendLabel={''}
                />
              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardItem
                  chartType={'count'}
                  dashboard={dashboard}
                  app={app}
                  kind={'solved_conversations'}
                  label={I18n.t('dashboard.resolutions')}
                  appendLabel={''}
                />
              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardItem
                  chartType={'count'}
                  dashboard={dashboard}
                  app={app}
                  kind={'incoming_messages'}
                  label={I18n.t('dashboard.incoming_messages')}
                  appendLabel={''}
                />
              </div>
            </div>

            <div className={'w-full p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                {/* <Chart /> */}
                <div className="mt-1 text-3xl leading-9 font-semibold text-gray-900">
                  {I18n.t('dashboard.visit_activity')}
                </div>

                <DashboardItem
                  chartType={'heatMap'}
                  dashboard={dashboard}
                  app={app}
                  kind={'visits'}
                />
              </div>
            </div>
            {/* Recent Deposits */}
            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardCard title={I18n.t('dashboard.users_browser')}>
                  <DashboardItem
                    chartType={'pie'}
                    dashboard={dashboard}
                    app={app}
                    label={I18n.t('dashboasrd.browser')}
                    kind={'browser'}
                  />
                </DashboardCard>
              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardCard title={I18n.t('dashboard.lead_os')}>
                  <DashboardItem
                    chartType={'pie'}
                    dashboard={dashboard}
                    app={app}
                    label={I18n.t('dashboasrd.lead_os')}
                    kind={'lead_os'}
                  />
                </DashboardCard>
              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardCard title={I18n.t('dashboard.user_os')}>
                  <DashboardItem
                    chartType={'pie'}
                    dashboard={dashboard}
                    app={app}
                    label={I18n.t('dashboasrd.user_os')}
                    kind={'user_os'}
                  />
                </DashboardCard>

              </div>
            </div>

            <div className={'lg:w-1/4 w-1/2 p-4'}>
              <div className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
                <DashboardCard title={I18n.t('dashboard.user_country')}>
                  <DashboardItem
                    chartType={'pie'}
                    dashboard={dashboard}
                    app={app}
                    label={I18n.t('dashboasrd.user_country')}
                    kind={'user_country'}
                  />
                </DashboardCard>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </div>
  )
}

function DashboardItem ({
  app,
  kind,
  dashboard,
  chartType,
  label,
  appendLabel,
  classes,
  styles
}) {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getData()
  }, [])

  function getData () {
    graphql(
      DASHBOARD,
      {
        appKey: app.key,
        range: {
          from: dashboard.from,
          to: dashboard.to
        },
        kind: kind
      },
      {
        success: (data) => {
          setData(data.app.dashboard)
          setLoading(false)
        },
        error: (err) => {
          setLoading(false)
        }
      }
    )
  }

  function renderChart () {
    switch (chartType) {
      case 'heatMap':
        return <HeatMap data={data} from={dashboard.from} to={dashboard.to} />

      case 'pie':
        return <Pie data={data} from={dashboard.from} to={dashboard.to} />
      case 'count':
        return (
          <Count
            data={data}
            from={dashboard.from}
            to={dashboard.to}
            label={label}
            appendLabel={appendLabel}
          />
        )
      case 'app_packages':
        return (
          <DashboardAppPackages
            data={data}
            dashboard={dashboard}
            classes={classes}
          />
        )
      default:
        return <p>no chart type</p>
    }
  }

  return (
    <div style={styles || { height: '140px' }}>
      {loading && <Progress />}
      {!loading && renderChart()}
    </div>
  )
}

function DashboardAppPackages (props) {
  const packages = props.data
  return (
    packages &&
      packages.map((o) => (
        <div key={`appPackage-${o.name}`} className="bg-white shadow overflow-hidden  sm:rounded-lg p-4">
          <DashboardAppPackage
            package={o}
            dashboard={props.dashboard}
            classes={props.classes}
          />
        </div>
      ))
  )
}

function DashboardAppPackage (props) {
  const dashboard = props.dashboard
  const pkg = props.package
  const data = pkg.data

  return (
    <div className="p-4">
      <div className="flex mb-2">
        <div className="mr-4">
          <img src={pkg.icon} width={64} />
        </div>

        <div>
          <p className="mt-1 text-3xl leading-9 font-semibold text-gray-900">
            {pkg.name}: {data.title}
          </p>

          <p className="text-sm leading-5 font-medium text-gray-500 truncate">
            {data.subtitle}
          </p>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="flex">
        {data.values &&
          data.values.map((v, i) => {
            return (
              <div className="w-1/4" key={`count-${i}`}>
                <Count
                  data={v.value}
                  from={dashboard.from}
                  to={dashboard.to}
                  label={v.label}
                  subtitle={`${v.value2}`}
                  // appendLabel={appendLabel}
                />
              </div>
            )
          })}
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(Dashboard))
