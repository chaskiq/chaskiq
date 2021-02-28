import React, { useState } from 'react'
import SegmentManager from '../../../components/segmentManager'

export default function Renderer ({ data, update }) {
  function handleRender () {
    switch (data.type) {
      case 'rules':
        return <RuleEditor update={update} data={data}/>
      case 'chat':
        return <ChatEditor update={update} data={data}/>
      case 'post':
        return <PostEditor update={update} data={data}/>
      case 'bot':
        return <BotEditor update={update} data={data}/>
      case 'tour':
        return <TourEditor update={update} data={data}/>
      default:
        break
    }
  }

  return (
    <div className="m-4">
      {handleRender(data)}
    </div>
  )
}

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

function ChatEditor ({ data, update }) {
  return <p>custom chat</p>
}
function PostEditor ({ data, update }) {
  return <p>custom post</p>
}
function BotEditor ({ data, update }) {
  return <p>custom bot</p>
}
function TourEditor ({ data, update }) {
  return <p>custom tour</p>
}
