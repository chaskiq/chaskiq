import React from 'react'
import { DASHBOARD } from '@chaskiq/store/src/graphql/queries'
import graphql from '@chaskiq/store/src/graphql/client'
import DataTable from '@chaskiq/components/src/components/Table' 

import Progress from '@chaskiq/components/src/components/Progress'
import HeatMap from '@chaskiq/components/src/components/charts/heatMap'
import Pie from '@chaskiq/components/src/components/charts/pie'
import Count from '@chaskiq/components/src/components/charts/count'

export default function DashboardItem({
  app,
  kind,
  dashboard,
  chartType,
  label,
  appendLabel,
  classes,
  styles,
  pkg,
}) {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getData()
  }, [])

  function getData(page=null) {
    graphql(
      DASHBOARD,
      {
        appKey: app.key,
        package: pkg,
        range: {
          from: dashboard.from,
          to: dashboard.to,
          page: page
        },
        kind: kind,
      },
      {
        success: (data) => {
          setData(data.app.dashboard)
          setLoading(false)
        },
        error: (_err) => {
          setLoading(false)
        },
      }
    )
  }

  function handleSearch(page){
    getData(page)
  }

  function renderChart() {
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
      case 'table':
        return (
          <DataTable
            title={'invitations'}
            meta={data.meta}
            data={data.collection}
            search={handleSearch}
            loading={false}
            disablePagination={true}
            columns={data.columns}
            enableMapView={false}
          />
        )
      case 'app_package':
          return (
            <DashboardAppPackage
              data={data}
              pkg={pkg}
              dashboard={dashboard}
              classes={classes}
            />
          )
      default:
        return <div>no chart type</div>
    }
  }

  return (
    <div style={styles || { height: '140px' }}>
      {loading && <Progress />}
      {!loading && renderChart()}
    </div>
  )
}

function DashboardAppPackage({data, dashboard}) {
  return (
    <div className="p-4 shadow-sm">
      <div className="flex mb-2">
        {
          data.package_icon && 
          <div className="mr-4">
            <img src={data.package_icon} width={64} />
          </div>
        }

        <div>
          <div className="mt-1 text-3xl leading-9 font-semibold text-gray-900 dark:text-gray-100">
            {data.package_name}: {data.title}
          </div>

          <div className="text-sm leading-5 font-medium text-gray-500 truncate">
            {data.subtitle}
          </div>
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