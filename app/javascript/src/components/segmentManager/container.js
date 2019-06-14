import React, {Component} from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  InlineFilterDialog, 
  SegmentItemButton,
  SaveSegmentModal
} from '../segmentManager'

import UserData from '../UserData'
import EnhancedTable from '../table'
import DataTable from '../dataTable'

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button'

import {appUsersFormat} from '../segmentManager/appUsersFormat'

const Wrapper = styled.div`
  //min-width: 600px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  display: -webkit-box;
  button {
    margin-right: 5px !important;
  }
`

class AppContent extends Component {

  constructor(props){
    super(props)
    this.getSegment = this.getSegment.bind(this)
  }

  getSegment(){
    const segmentID = this.props.match.params.segmentID
    segmentID ? this.props.actions.fetchAppSegment(segmentID) : null    
  }

  componentDidMount(){
    this.getSegment()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.match.params && prevProps.match.params.segmentID !== this.props.match.params.segmentID) {
      this.getSegment()
    }
  }

  render(){
    console.log("Container props!---", this.props)
    const {searching, collection, meta} = this.props.app_users
    //const {id, name} = this.props.segment
    //console.log("segment:!" , segment.id, segment, this.props.segment)
 
    return <div style={{marginTop: '20px'}}>

            { this.props.app.key && this.props.segment && this.props.segment.id ? 
              <div>
              <p>{this.props.segment.name}</p>
              <AppUsers
                actions={this.props.actions}
                history={this.props.history}
                app={this.props.app}
                segment={this.props.segment}
                app_users={collection}
                meta={meta}
                searching={searching}
         
              /></div> : null 
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

  handleClickOnSelectedFilter = (jwtToken)=>{
    const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}/${jwtToken}`
    this.props.history.push(url) 
  }

  getTextForPredicate = (o)=>{
    if(o.type === "match"){
      return `Match ${o.value === "and" ? "all" : "any" } criteria`
    }else{
      return `Match: ${o.attribute} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`
    }
  }

  caption = ()=>{
    return <div>
            <ButtonGroup>
              {
                this.props.actions.getPredicates().map((o, i)=>{
                    return <SegmentItemButton 
                            key={i}
                            index={i}
                            predicate={o}
                            predicates={this.props.actions.getPredicates()}
                            open={ !o.comparison }
                            appearance={ o.comparison ? "primary" : "default"} 
                            text={this.getTextForPredicate(o)}
                            updatePredicate={this.props.actions.updatePredicate}
                            predicateCallback={(jwtToken)=> this.handleClickOnSelectedFilter.bind(this)}
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

            {
              /*
                <hr/>

                <div style={{float: "right"}}>
                  <ButtonGroup>
                    
                    {dropdown()}

                    <Button 
                      isLoading={false} 
                      onClick={this.toggleMap.bind(this)}
                      isSelected={!this.state.map_view}>
                      <i className="fas fa-list"></i>
                      {" "}
                      List
                    </Button>

                    <Button 
                      isSelected={this.state.map_view}
                      isLoading={false} 
                      onClick={this.toggleList.bind(this)}>
                      <i className="fas fa-map"></i>
                      {" "}
                      Map
                    </Button>

                  </ButtonGroup>
                </div>

                <span>Users {this.props.meta['total_count']}</span>
                
                <hr/>              
              */
            }

           </div>
  }

  showUserDrawer = (e)=>{
    this.setState({ rightDrawer: true }, ()=>{
      this.getUserData(e[0])
    });
  }

  toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({rightDrawer: open });
  };

  getUserData = (id)=>{

    graphql(APP_USER, {
        appKey: this.props.app.key, 
        id: id
      }, 
      {
        success: (data)=>{
          this.setState({
            selectedUser: data.app.appUser
          })
      },
      error: ()=>{

      }
    })
  }

  render(){
    return <Wrapper>

            {this.caption()}

            <DataTable 
              title={this.props.segment.name}
              columns={appUsersFormat()} 
              meta={this.props.meta}
              data={this.props.app_users}
              search={this.props.actions.search}
              loading={this.props.searching}
              onRowClick={(e)=>{
                this.showUserDrawer(e)
              }}
            />

            <Drawer 
              anchor="right" 
              open={this.state.rightDrawer} 
              onClose={this.toggleDrawer('right', false)}>
              
              {
                this.state.selectedUser ? 
                  <UserData width={ '300px'}
                    appUser={this.state.selectedUser} /> : null
              }

            </Drawer>
    
          </Wrapper>
  }
}


function mapStateToProps(state) {

  const { auth, app, segment, app_users } = state
  const { loading, isAuthenticated } = auth

  const { searching, meta} = app_users

  return {
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

