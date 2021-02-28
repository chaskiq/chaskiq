import React from 'react'
import TourManager from "../../../components/Tour";
import { connect } from 'react-redux'

function TourEditor ({ data, update, app }) {
  return <div>
		<TourManager
			app={app}
			//url={this.url()}
			updateData={(d)=> console.log(d)}
			data={ {} }
		/>
  </div>
}

function mapStateToProps (state) {
  const { app, status_message } = state
  return {
    status_message, app
  }
}

export default connect(mapStateToProps)(TourEditor)
