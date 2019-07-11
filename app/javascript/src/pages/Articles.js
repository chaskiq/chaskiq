import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField
      } from '@material-ui/core';

import gravatar from '../shared/gravatar'
import CircularProgress from '@material-ui/core/CircularProgress';


import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
import DataTable from "../components/newTable";

import {Link} from 'react-router-dom'


import graphql from '../graphql/client'
import {ARTICLES} from '../graphql/queries'
import {
  CREATE_ARTICLE, 
  EDIT_ARTICLE, 
  DELETE_ARTICLE
} from '../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import FormDialog from '../components/FormDialog'
import ArticlesNew from './articles/new'


const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
});

class Articles extends Component {

  state = {
    meta: {},
    tabValue: 0,
  };

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="All" />
              <Tab textColor="inherit" label="Published" />
              <Tab textColor="inherit" label="Draft" />
            </Tabs>
  }

  renderTabcontent = ()=>{

    switch (this.state.tabValue){
      case 0:
        return <AllArticles {...this.props}/>

      case 1:
        return <PublishedArticles {...this.props}/>
      case 2:
        return 
      case 3:
        return <p>drafts</p>
    }
  }

  render() {
    return (
       <React.Fragment>

        <Route exact path={`/apps/${this.props.app.key}/articles`}
          render={(props) => {
            return <React.Fragment>
              
              <ContentHeader 
                title={ 'Articles' }
                tabsContent={ this.tabsContent() }
              />

              <Link to={`/apps/${this.props.app.key}/articles/new`}>
                new
              </Link>

              {this.renderTabcontent()}

            </React.Fragment>
          }} 
        />

        <Route exact path={`/apps/${this.props.app.key}/articles/:id`}
          render={(props) => {
            return <ArticlesNew
                      history={this.props.history}
                      data={{}}
                   />
          }} 
        />


        
      </React.Fragment>
    );
  }
}


class AllArticles extends React.Component {
  state = {
    collection: [],
    loading: true
  }

  componentDidMount(){
    this.search()
  }

  getArticles = ()=>{
    graphql(ARTICLES, {appKey: this.props.app.key, page: 1 }, {
      success: (data)=>{
        this.setState({
          collection: data.app.articles.collection, 
          meta: data.app.articles.meta,
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
    }, this.getArticles )
  }

  render(){
    return <Content>
             {
               !this.state.loading ?
               <DataTable 
                elevation={0}
                title={'agents'}
                meta={{}}
                rows={this.state.collection}
                search={this.search}
                loading={this.state.loading}
                disablePagination={true}
                columns={[
                  {name: "id", title: "id"},
                  {name: "title", title: "title"},
                  {name: "state", title: "state"},
                ]}
                defaultHiddenColumnNames={[]}
                tableColumnExtensions={[
                  { columnName: 'title', width: 250 },
                  { columnName: 'id', width: 10 },
                ]}

                //tableEdit={true}
                //editingRowIds={["email", "name"]}
                commitChanges={(aa, bb)=>{debugger}}
                //leftColumns={this.props.leftColumns}
                //rightColumns={this.props.rightColumns}
                //toggleMapView={this.props.toggleMapView}
                //map_view={this.props.map_view}
                enableMapView={false}
             /> : <CircularProgress/> 
           }
           </Content>  
  }


}

class PublishedArticles extends React.Component {
  state = {
    collection: [],
    loading: true,
    isOpen: false,
    sent: false,
  }

  input_ref = null

  open  = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });

  componentDidMount(){
    this.search()
  }

  sendInvitation = ()=>{
    /*graphql(ARTICLES, {
      appKey: this.props.app.key,
      email: this.input_ref.value
    }, {
      success: (data)=>{
        this.setState({
          sent: true,
          isOpen: false,
        }, this.search)
      },
      error: ()=>{

      }
    })*/
  }

  inviteButton = ()=>{

    return <React.Fragment>
            {
              this.state.isOpen ?
                <FormDialog 
                  open={this.state.isOpen}
                  actionButton={"add user"} 
                  titleContent={"Add a new agent"}
                  contentText={"send an activable invitation"}

                  formComponent={
                    <TextField
                      autoFocus
                      margin="dense"
                      id="email"
                      name="email"
                      label="email"
                      type="email"
                      ref={"input"}
                      fullWidth
                      inputRef={input => (this.input_ref = input)}
                    />
                  }


                  dialogButtons={
                    <React.Fragment>
                      <Button onClick={this.close} color="primary">
                        Cancel
                      </Button>

                      <Button onClick={this.sendInvitation} 
                        zcolor="primary">
                        Send invitation
                      </Button>

                    </React.Fragment>
                  }
                /> 
                 : null 
            }


            <Button variant="contained" 
              color="primary" 
              onClick={this.open}
              className={this.props.classes.addUser}>

              Add user
            </Button>

          </React.Fragment>
  }

  getAgents = ()=>{
    /*graphql(PENDING_AGENTS, {appKey: this.props.app.key, }, {
      success: (data)=>{
        this.setState({
          collection: data.app.notConfirmedAgents, 
          loading: false
        })
      },
      error: ()=>{

      }
    })*/
  }

  search = ()=>{
    this.setState({
      loading: true, 
    }, this.getAgents )
  }

  render(){
    return <Content actions={this.inviteButton()}>
            {
              !this.state.loading ?
                <DataTable 
                  elevation={0}
                  title={'invitations'}
                  meta={{}}
                  rows={this.state.collection}
                  search={this.search}
                  loading={this.state.loading}
                  disablePagination={true}
                  columns={[
                    {name: "id", title: "id"},
                    {name: "avatar", title: "",
                      getCellValue: row => (row ? 
                        <Link to={`/apps/${this.props.app.key}/agents/${row.id}`}>
                          <Avatar
                            name={row.email}
                            size="medium"
                            src={gravatar(row.email)}
                          />
                        </Link>
                       : undefined)
                    },
                    {name: "email", title: "email"},
                    {name: "name", title: "name"},
                    {name: "invitationAcceptedAt", title: "invitationAcceptedAt"},
                    {name: "invitationSentAt", title: "invitationSentAt"},
                  ]}
                  defaultHiddenColumnNames={[]}
                  tableColumnExtensions={[
                    { columnName: 'email', width: 250 },
                    { columnName: 'id', width: 10 },
                    { columnName: 'avatar', width: 55 },
                  ]}
                  enableMapView={false}
                />  : <CircularProgress/> 
            }
           </Content>    
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


export default withRouter(connect(mapStateToProps)(withStyles(styles)(Articles)))
