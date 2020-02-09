import React from "react"
import { connect } from 'react-redux'
import Content from '../../components/Content'
import EmptyView from '../../components/emptyView'
import {setCurrentSection} from '../../actions/navigation'
import { withRouter } from 'react-router-dom'


function CampaignHome({dispatch}){

  React.useEffect(()=>{
    dispatch(
      setCurrentSection("Campaigns")
    )
  }, [])

  return (

    <div>

            <Content>
                
                  <EmptyView 
                    title={"campaigns"} 
                    subtitle={
                      <div>
                        This is the campaigns section, you can create newsletters
                        , popup messages and guided tours
                      </div>

                    }/>
                
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
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(CampaignHome))