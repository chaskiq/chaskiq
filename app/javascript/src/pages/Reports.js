import React from 'react'
import ContentHeader from '@chaskiq/components/src/components/PageHeader'
import Content from '@chaskiq/components/src/components/Content'
import Overview from './reports/Overview'
import { connect } from 'react-redux'
import moment from 'moment'
import { Switch, Route, withRouter } from 'react-router-dom'
import Package from './reports/Package'

import {
  setCurrentSection, setCurrentPage
} from '@chaskiq/store/src/actions/navigation'
import { ChartsIcons } from '@chaskiq/components/src/components/icons'

function Reports({match, dispatch, app}){

  React.useEffect(() => {
    dispatch(setCurrentPage('Reports'))
    dispatch(setCurrentSection('Reports'))
  }, [])

  const initialData = {
    loading: true,
    from: moment().add(-1, 'week'),
    to: moment(), // .add(-1, 'day')
  }

  const [dashboard, _setDashboard] = React.useState(initialData)

  return (
    <div>
    <Content>
      <ContentHeader
        title={
          <span className="space-x-3">
            <ChartsIcons/>
            Reports
          </span>
      
        }
        // actions={}
      />

      <Switch>
        <Route
          path={`${match.url}/leads`}
          render={(props) => <p>somewhere</p> }
        />

        <Route
          path={`${match.url}/packages/:pkg`}
          render={(props) => {
            return <Package app={app} dashboard={dashboard} pkg={props.match.params.pkg} />
            }
          }
        />

        <Route
          path={`${match.url}`}
          render={(props) => <Overview app={app} dashboard={dashboard} /> }
        />

      </Switch>

    </Content>
  </div>
  )
}

function mapStateToProps(state) {
  const { app } = state
  return {
    app,
  }
}


export default withRouter(connect(mapStateToProps)(Reports))
