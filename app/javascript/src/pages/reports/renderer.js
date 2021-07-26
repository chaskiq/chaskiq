import React from 'react'
import DashboardCard from '@chaskiq/components/src/components/dashboard/card'
import DashboardItem from './ReportItem'

export default function ReportRenderer({
  app, 
  dashboard, 
  kind,
  label,
  appendLabel, 
  chartType, 
  classes,
  styles,
  pkg
}){

  function renderType(){
    switch (chartType) {
      case 'count':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg p-4">
                  <DashboardItem
                    chartType={chartType}
                    dashboard={dashboard}
                    app={app}
                    kind={kind}
                    label={label}
                    pkg={pkg}
                    appendLabel={appendLabel}
                  />
                </div>
              </div>
      case 'heatMap':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg p-4">
                  <div className="mt-1 text-3xl leading-9 font-semibold text-gray-900 dark:text-gray-100">
                    {label}
                  </div>
                  <DashboardItem
                    chartType={chartType}
                    dashboard={dashboard}
                    app={app}
                    pkg={pkg}
                    kind={kind}
                  />
                </div>
              </div>
      case 'pie':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden  sm:rounded-lg p-4">
                  <DashboardCard title={label}>
                    <DashboardItem
                      chartType={chartType}
                      dashboard={dashboard}
                      app={app}
                      pkg={pkg}
                      label={label}
                      kind={kind}
                    />
                  </DashboardCard>
                </div>
              </div>
      case 'table':
      case 'app_package':
      return  <div className={classes}>
                <DashboardItem
                  chartType={chartType}
                  dashboard={dashboard}
                  app={app}
                  label={label}
                  kind={kind}
                  pkg={pkg}
                  styles={styles}
                />
              </div>
      default:
        return <p>no display for {chartType}</p>
    }
  }

  return renderType()
}