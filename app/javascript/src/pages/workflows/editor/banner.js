import React from 'react'
import CampaignEditor from '../../../pages/campaigns/editor'
import { connect } from 'react-redux'

function BannerEditor ({ data, update, app }) {
  return <div>
    <CampaignEditor
      mode={'banners'}
      // url={this.url()}
      updateData={update}
			app={app}
      data={{bannerData: {} }}
    />
  </div>
}

function mapStateToProps (state) {
  const { app, status_message } = state
  return {
    status_message, app
  }
}

export default connect(mapStateToProps)(BannerEditor)
