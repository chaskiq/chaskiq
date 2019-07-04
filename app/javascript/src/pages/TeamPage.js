import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
import DataTable from "../components/newTable";

import {Link} from 'react-router-dom'


import graphql from '../graphql/client'
import {AGENTS} from '../graphql/queries'

class TeamPage extends Component {


  state = {
    agents: [],
    meta: {},
    loading: false,
    tabValue: 0
  }

  componentDidMount(){
    this.search()
  }

  getAgents = ()=>{
    graphql(AGENTS, {appKey: this.props.app.key, }, {
      success: (data)=>{

        this.setState({
          agents: data.app.agents, 
          loading: false
        })
      },
      error: ()=>{

      }
    })
  }

  search = (item)=>{
    this.setState({
      loading: true, 
    }, this.getAgents )
  }


  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Team" />
              <Tab textColor="inherit" label="Invitations" />
            </Tabs>
  }


  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return this.renderAgentsTable()

      case 1:
        return <p>bbb</p>
      case 2:
        return 
      case 3:
        return <p>ddkd</p>
    }
  }


  renderAgentsTable = ()=>{
    return <DataTable 
                title={'agents'}
                meta={{}}
                rows={this.state.agents}
                search={this.search}
                loading={this.state.loading}
                columns={[
                  {name: "id", title: "id"},
                  {name: "email", title: "email"},
                  {name: "name", title: "name"},
                  {name: "actions", title: "actions", 

                      getCellValue: row => (row ? 

                        <Link to={`/apps/${this.props.app.key}/agents/${row.id}`}>
                          aaa
                        </Link>

                       : undefined)
                    
                }
                ]}
                defaultHiddenColumnNames={[]}
                tableColumnExtensions={[]}
                //tableEdit={true}
                //editingRowIds={["email", "name"]}
                commitChanges={(aa, bb)=>{debugger}}
                //leftColumns={this.props.leftColumns}
                //rightColumns={this.props.rightColumns}
                //toggleMapView={this.props.toggleMapView}
                //map_view={this.props.map_view}
                enableMapView={false}
           />  
  }

  render() {
    return (
       <React.Fragment>

        <ContentHeader 
          title={ 'Team' }
          tabsContent={ this.tabsContent() }
        />

        <Content>
          {this.renderTabcontent()}
        </Content>

      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {

  const { auth, app } = state
  const { isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(TeamPage))
