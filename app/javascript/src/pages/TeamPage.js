import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

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
    loading: false
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



  render() {
    return (
      <ContentWrapper>

        { !this.state.loading ?
          <DataTable 
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
          /> : null
        }

      </ContentWrapper>
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
