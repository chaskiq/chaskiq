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

  function renderDashboardItem( ){
    return (
      <DashboardItem
        chartType={chartType}
        dashboard={dashboard}
        app={app}
        label={label}
        kind={kind}
        pkg={pkg}
        styles={styles}
        appendLabel={appendLabel}
      />
    )
  }

  function renderType(){
    switch (chartType) {
      case 'count':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg p-4">
                  {renderDashboardItem()}
                </div>
              </div>
      case 'heatMap':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg p-4">
                  <div className="mt-1 text-3xl leading-9 font-semibold text-gray-900 dark:text-gray-100">
                    {label}
                  </div>
                  {renderDashboardItem()}
                </div>
              </div>
      case 'pie':
        return <div className={classes}>
                <div className="bg-white dark:bg-gray-900 shadow overflow-hidden  sm:rounded-lg p-4">
                  <DashboardCard title={label}>
                    {renderDashboardItem()}
                  </DashboardCard>
                </div>
              </div>
      case 'table':
      case 'app_package':
      return  <div className={classes}>
                {renderDashboardItem()}
              </div>
      default:
        return <p>no display for {chartType}</p>
    }
  }

  return renderType()
}