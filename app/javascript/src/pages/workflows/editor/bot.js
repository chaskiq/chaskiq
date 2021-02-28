import React, { useState } from 'react'

import { BotPathEditor } from '../../../pages/bots/editor'

import { connect } from 'react-redux'

function BotEditor ({ data, update, app, dispatch }) {
  const [botTask, setBotTask] = useState({})
  const [errors, setErrors] = useState({})
  const [paths, setPaths] = useState([])
  const [searchFields, setSearchFields] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)

	function saveData(data){
		console.log('save!')
	}

  return <div>
    <BotPathEditor
      app={app}
      data={botTask}
      updateData={setBotTask}
      saveData={saveData}
      errors={errors}
      paths={paths}
      setPaths={setPaths}
      searchFields={searchFields}
      selectedPath={selectedPath}
      setSelectedPath={setSelectedPath}
    />
  </div>
}

function mapStateToProps (state) {
  const { app, status_message } = state
  return {
    status_message, app
  }
}

export default connect(mapStateToProps)(BotEditor)
