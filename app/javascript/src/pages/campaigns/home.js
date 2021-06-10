import React from 'react'
import { connect } from 'react-redux'
import Content from '@chaskiq/components/src/components/PageHeader'
import EmptyView from '@chaskiq/components/src/components/EmptyView'

import { actions } from '@chaskiq/store'

import { withRouter } from 'react-router-dom'
import image from '../../images/delivery-icon8.png'

const { setCurrentSection } = actions

function CampaignHome({ dispatch }) {
  React.useEffect(() => {
    dispatch(setCurrentSection('Campaigns'))
  }, [])

  return (
    <div>
      <Content>
        <EmptyView
          title={I18n.t('campaigns.home.title')}
          shadowless
          subtitle={
            <div>
              {I18n.t('campaigns.home.text')}
              <img src={image} width={'100%'} />
            </div>
          }
        />
      </Content>
    </div>
  )
}

function mapStateToProps(state) {
  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated,
  }
}

export default withRouter(connect(mapStateToProps)(CampaignHome))
