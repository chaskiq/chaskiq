import React from 'react'
import SegmentManager from '../../../components/segmentManager'
import { connect } from 'react-redux'

function RuleEditor ({ data, update }) {
  const [predicates, setPredicates] = useState(data.data.predicates)

  return (
    <div className="divide-y-2">
      <div className="flex justify-between">
        <h2>save rule</h2>
        <button onClick={ () => update({ ...data, data: { ...data.data, predicates: predicates } }) }>save</button>
      </div>
      <SegmentManager
        // {...this.props}
        loading={false}
        predicates={ predicates }
        meta={ { } }
        collection={ [] }
        updatePredicate={ (data) => {
          setPredicates(data)
        } }
        addPredicate={ (data) => setPredicates(
          predicates.concat({ ...data, attribute: data.name })
        ) }
        deletePredicate={ () => console.log('ss') }
        search={ () => console.log('search') }
        loading={ false }
        columns={ [] }
        defaultHiddenColumnNames={[
          'id',
          'state',
          'online',
          'lat',
          'lng',
          'postal',
          'browserLanguage',
          'referrer',
          'os',
          'osVersion',
          'lang'
        ]}
        // selection [],
        tableColumnExtensions={[
          // { columnName: 'id', width: 150 },
          { columnName: 'email', width: 250 },
          { columnName: 'lastVisitedAt', width: 120 },
          { columnName: 'os', width: 100 },
          { columnName: 'osVersion', width: 100 },
          { columnName: 'state', width: 80 },
          { columnName: 'online', width: 80 }
          // { columnName: 'amount', align: 'right', width: 140 },
        ]}
        leftColumns={['email']}
        rightColumns={['online']}
        // toggleMapView={this.toggleMapView}
        // map_view={this.state.map_view}
        // enableMapView={true}
      >
      </SegmentManager>

    </div>
  )
}

function mapStateToProps (state) {
  const { app, status_message } = state
  return {
    status_message, app
  }
}

export default connect(mapStateToProps)(RuleEditor)
