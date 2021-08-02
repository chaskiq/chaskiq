import React from 'react'
import ReportRenderer from './renderer'
import { APP_PACKAGE_DASHBOARD } from '@chaskiq/store/src/graphql/queries'
import graphql from '@chaskiq/store/src/graphql/client'

export default function AppPackageReport({dashboard, app, pkg}){
  
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  function getData() {
    setLoading(true)
    graphql(
      APP_PACKAGE_DASHBOARD,
      {
        appKey: app.key,
        package: pkg,
      },
      {
        success: (data) => {
          setData(data.app.appPackageDashboard)
          setLoading(false)
        },
        error: (_err) => {
          setLoading(false)
        },
      }
    )
  }

  React.useEffect(()=>{
    getData()
  }, [pkg])

  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {
      !loading && data &&
      data.paths.map((o, i)=>(
        <ReportRenderer 
          pkg={data.name}
          app={app}
          {...o}
          dashboard={dashboard} 
          key={`report-block-${pkg}-${i}`} 
        />
      ))
    }
    {
      loading && <p>loading...</p>
    }
  </div>
}