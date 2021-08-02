import React from 'react'

import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { APP_PACKAGES_DASHBOARD } from '@chaskiq/store/src/graphql/queries'
import graphql from '@chaskiq/store/src/graphql/client'
import moment from 'moment'

function SidebarMenu({dispatch, app}){
  const cc = `              
  bg-white hover:text-gray-600 hover:bg-gray-100 
  dark:hover:text-gray-100 dark:hover:bg-gray-700
  dark:bg-black dark:text-gray-100 dark:focus:bg-black
  focus:outline-none focus:bg-gray-200
  group flex items-center 
  px-2 py-2 
  text-sm leading-5 font-medium text-gray-900 
  rounded-md transition ease-in-out duration-150`

  const [data, setData] = React.useState([])

  function getData() {
    graphql(
      APP_PACKAGES_DASHBOARD,
      {
        appKey: app.key
      },
      {
        success: (data) => {
          setData(data.app.appPackagesDashboard)
        },
        error: (_err) => {
        },
      }
    )
  }

  React.useEffect(()=>{
    getData()
  }, [])

  return (
    <>
      <Link className={cc} to={`/apps/${app.key}/reports/`}>overview</Link>
      {/*<Link className={cc} to={`/apps/${app.key}/reports/leads`}>leads</Link>*/}
      {data.map((d,i)=>(
        <Link key={`packages-sidebar-${i}`} 
          className={cc} 
          to={`/apps/${app.key}/reports/packages/${d.name}`}>
          {d.name}
        </Link>
      ))}
    </>
  )
}

function mapStateToProps(state) {
  const { app } = state
  return {
    app,
  }
}
export default connect(mapStateToProps)(SidebarMenu)
