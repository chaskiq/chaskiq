import React from 'react'
import CampaignEditor from '../../../pages/campaigns/editor'
import { connect } from 'react-redux'

function EmailEditor ({ data, update, app }) {
  return <div>
    <CampaignEditor
      mode={'campaigns'}
      // url={this.url()}
      updateData={update}
			app={app}
      data={ { } }
    />
  </div>
}

function mapStateToProps (state) {
  const { app, status_message } = state
  return {
    status_message, app
  }
}

export default connect(mapStateToProps)(EmailEditor)
