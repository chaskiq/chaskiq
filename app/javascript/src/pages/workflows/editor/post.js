import React from 'react'
import CampaignEditor from '../../../pages/campaigns/editor'
import { connect } from 'react-redux'

function PostEditor ({ data, update, app }) {
  return <div>
    <CampaignEditor
      mode={'user_auto_messages'}
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

export default connect(mapStateToProps)(PostEditor)
