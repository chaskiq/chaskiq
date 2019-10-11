import React, {Component} from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from '@emotion/styled'
import {
  InlineFilterDialog, 
  SaveSegmentModal
} from '../segmentManager'

import SegmentItemButton from '../segmentManager/itemButton'


import UserData from '../UserData'
import Table from '../table/index'
import {toggleDrawer} from '../../actions/drawer'

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button'


import {appUsersFormat} from '../segmentManager/appUsersFormat'
import Map from '../map/index.js'

import {dispatchSegmentUpdate} from '../../actions/segments'

import {setCurrentPage} from '../../actions/navigation'
import userFormat from '../table/userFormat'
import { CircularProgress } from '@material-ui/core'

const Wrapper = styled.div`
  //min-width: 600px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin-bottom: 2em;
  button {
    margin-right: 5px !important;
    margin: 2px
  }
`


class AppContent extends Component {

  constructor(props){
    super(props)
    this.getSegment = this.getSegment.bind(this)
  }

  componentDidMount(){

    this.props.dispatch(
      setCurrentPage('Platform')
    )
    
    this.props.dispatch(
      dispatchSegmentUpdate({
        id: this.props.match.params.segmentID,
        jwt: this.props.match.params.Jwt
      })
    )

    this.getSegment(()=>{
      this.props.actions.search()
    })
  }

  getSegment(){
    const segmentID = this.props.match.params.segmentID
    segmentID ? this.props.actions.fetchAppSegment(segmentID) : null    
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.match.params && prevProps.match.params.segmentID !== this.props.match.params.segmentID) {
      
      this.props.dispatch(
        dispatchSegmentUpdate({
          id: this.props.match.params.segmentID,
          jwt: this.props.match.params.Jwt
        })
      )

      this.getSegment(()=>{
        this.props.actions.search()
      })
    }

    if (prevProps.segment.jwt && prevProps.segment.jwt !== this.props.segment.jwt) {
      console.info("cambio jwt")
      this.props.actions.search()
    }

    // check empty token , used when same sagment changes jwt
    if (prevProps.match.params.Jwt !== this.props.match.params.Jwt && !this.props.match.params.Jwt) {
      
      this.props.dispatch(
        dispatchSegmentUpdate({
          jwt: this.props.match.params.Jwt
        })
      )

      this.getSegment(()=>{
        this.props.actions.search()
      })
    }

  }

  render(){
    const {searching, collection, meta} = this.props.app_users
    //const {id, name} = this.props.segment
    //console.log("segment:!" , segment.id, segment, this.props.segment)
 
    return <div style={{marginTop: '20px'}}>

            { this.props.app.key && this.props.segment && this.props.segment.id ? 
              
              <AppUsers
                actions={this.props.actions}
                history={this.props.history}
                app={this.props.app}
                segment={this.props.segment}
                app_users={collection}
                app_user={this.props.app_user}
                meta={meta}
                searching={searching}
         
              /> : null 
            }
          </div>
  }
}


class AppUsers extends Component {
  constructor(props){
    super(props)
    this.state = {
      map_view: false,
      rightDrawer: false,
      selectedUser: null,
    }
    this.toggleMap = this.toggleMap.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  toggleMap = (e)=>{
    this.setState({map_view: false  })
  }

  toggleList = (e)=>{
    this.setState({map_view: true  })
  }

  toggleMapView= (e)=>{
    this.setState({map_view: !this.state.map_view})
  }

  handleClickOnSelectedFilter = (jwtToken)=>{
    const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}/${jwtToken}`
    this.props.history.push(url) 
  }

  displayName = (o)=>{
    return o.attribute.split("_").join(" ")
  }

  getTextForPredicate = (o)=>{
    if(o.type === "match"){
      return `Match ${o.value === "and" ? "all" : "any" } criteria`
    }else{
      return `${this.displayName(o)} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`
    }
  }

  getStatePredicate = ()=>{
    return this.props.actions.getPredicates().find((o)=> (
        o.attribute === "subscription_state" 
      )
    )
  }

  caption = ()=>{
    return <div>
            <ButtonGroup>

              { /*this.getStatePredicate() ?
                <button>
                  {this.getStatePredicate().attribute}
                </button> : null
              */}


              {
                this.props.actions.getPredicates()
                  //.filter((o)=>(o.attribute !== "subscription_state"))
                    .map((o, i)=>{
                    return <SegmentItemButton 
                            key={`segment-item-button-${i}`}
                            index={i}
                            predicate={o}
                            predicates={this.props.actions.getPredicates()}
                            open={ !o.comparison }
                            appearance={ o.comparison ? "primary" : "default"} 
                            text={this.getTextForPredicate(o)}
                            updatePredicate={this.props.actions.updatePredicate}
                            predicateCallback={(jwtToken)=> this.handleClickOnSelectedFilter.bind(this)(jwtToken)}
                            deletePredicate={this.props.actions.deletePredicate}                          
                           />
                })
              }

              <InlineFilterDialog {...this.props} 
                handleClick={ this.handleClickOnSelectedFilter.bind(this)}
                addPredicate={this.props.actions.addPredicate}
              />

              <SaveSegmentModal 
                title="Save Segment" 
                segment={this.props.segment}
                savePredicates={this.props.actions.savePredicates}
                predicateCallback={()=> {
                  const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}`
                  this.props.history.push(url)
                }}
                deleteSegment={this.props.actions.deleteSegment}
              />

            </ButtonGroup>
           </div>
  }

  showUserDrawer = (o)=>{
    this.props.actions.showUserDrawer(o.id)
  }

  getUserData = (id)=>{
    this.props.actions.setAppUser(id)
  }

  render(){
    return <Wrapper>

            {this.caption()}

            { 
              this.state.map_view && 
              !this.props.searching && 
              this.props.app.key && 
              this.props.segment && 
              this.props.segment.id ? 

              <Map 
                interactive={true}
                segment={this.props.segment}
                data={this.props.app_users}
              /> : null

            }

            { !this.props.searching && <Table 
              data={this.props.app_users} 
              loading={this.props.searching}
              columns={userFormat(this.showUserDrawer)}

              defaultHiddenColumnNames={['id', 
                    'state', 
                    'online', 
                    'lat', 
                    'lng', 
                    'postal',
                    'browserLanguage', 
                    'referrer', 
                    'os', 
                    'osVersion',
                    'lang']
              }

              //selection [],
              tableColumnExtensions={[
                //{ columnName: 'id', width: 150 },
                { columnName: 'email', width: 250 },
                { columnName: 'lastVisitedAt', width: 120 },
                { columnName: 'os', width: 100 },
                { columnName: 'osVersion', width: 100 },
                { columnName: 'state', width: 80 },
                { columnName: 'online', width: 80 },

                //{ columnName: 'amount', align: 'right', width: 140 },
              ]}
              leftColumns={ ['email']}
              rightColumns={ ['online']}

              //rows={this.props.app_users}
              meta={this.props.meta}
              search={this.props.actions.search}
              showUserDrawer={this.showUserDrawer}
              toggleMapView={this.toggleMapView}
              map_view={this.state.map_view}
              enableMapView={true}
            />}

            {
              this.props.searching && <CircularProgress/>
            }



    
          </Wrapper>
  }
}


function mapStateToProps(state) {

  const { auth, app, segment, app_users, app_user } = state
  const { loading, isAuthenticated } = auth

  const { searching, meta} = app_users

  return {
    app_user,
    app_users,
    searching,
    meta,
    segment,
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(AppContent))

