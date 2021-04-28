import React from 'react'
import {
  getPackage,
} from './utils'

import {Progress} from './styled'

import {DefinitionRenderer} from './components'

export function BaseInserter ({
  //onItemSelect,
  conversation,
  conversation_part,
  pkg,
  app,
  onInitialize,
  location
}) {
  const [p, setPackage] = React.useState(null)
  const params = {
    appKey: app.key,
    id: pkg.name + '',
    hooKind: 'configure',
    ctx: {
      location,
      conversation_part: conversation_part?.key
    }
  }

  React.useEffect(() => {
    if (p && (p.kind === 'initialize')) {
      onInitialize({
        hooKind: p.kind,
        definitions: p.definitions,
        values: p.values,
        wait_for_input: p.wait_for_input,
        id: pkg.id,
        name: pkg.name
      })
    }
  }, [p])

  React.useEffect(() => getPackage(params, location, (data) => {
    setPackage(data.app.appPackage.callHook)
  }), [])

  function updatePackage (formData, cb) {
    const newParams = { ...params, ctx: {
      ...formData, 
        conversation_key: conversation?.key, 
        conversation_part: conversation_part?.key
      }
    }
    getPackage(newParams, location, (data) => {
      setPackage(data.app.appPackage.callHook)
      cb && cb()
    })
  }

  return (
    <div>
      {
        !p && <Progress/>
      }
      {p && <DefinitionRenderer
        location={location}
        schema={p.definitions}
        getPackage={getPackage}
        appPackage={p}
        updatePackage={updatePackage}
      />}
    </div>
  )
}