import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Moment from 'react-moment'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'

import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'

import gravatar from '../shared/gravatar'
import CircularProgress from '@material-ui/core/CircularProgress';
import {AnchorLink} from '../shared/RouterLink'


import MainSection from '../components/MainSection';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import logo from '../images/logo.png';
import DataTable from "../components/table";

import {Link} from 'react-router-dom'


import graphql from '../graphql/client'
import {AGENTS, PENDING_AGENTS} from '../graphql/queries'
import {INVITE_AGENT} from '../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import FormDialog from '../components/FormDialog'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";


const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
});

class TeamPage extends Component {

  state = {
    meta: {},
    tabValue: 0,
  };

  componentDidMount(){
    this.props.dispatch(setCurrentSection("Settings"))
    this.props.dispatch(setCurrentPage("team"))
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
        return <AppUsers {...this.props}/>

      case 1:
        return <NonAcceptedAppUsers {...this.props}/>
      case 2:
        return 
      case 3:
        return <p>ddkd</p>
    }
  }

  render() {
    return (
       <React.Fragment>

        <ContentHeader 
          title={ 'Team' }
          tabsContent={ this.tabsContent() }
        />

        
          {this.renderTabcontent()}
        

      </React.Fragment>
    );
  }
}


class AppUsers extends React.Component {
  state = {
    collection: [],
    loading: true
  }

  componentDidMount(){
    this.search()
  }

  getAgents = ()=>{
    graphql(AGENTS, {appKey: this.props.app.key, }, {
      success: (data)=>{
        this.setState({
          collection: data.app.agents, 
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

  render(){
    return <Content>
             {
               !this.state.loading ?
               <DataTable 
                elevation={0}
                title={'agents'}
                meta={{}}
                data={this.state.collection}
                search={this.search}
                loading={this.state.loading}
                disablePagination={true}
                columns={[
                  {field: "id", title: "id"},
                  {field: "avatar", title: "",
                    render: row => (row ? 
                      <Link to={`/apps/${this.props.app.key}/agents/${row.id}`}>
                        <Avatar
                          name={row.email}
                          size="medium"
                          src={gravatar(row.email)}
                        />
                      </Link>
                     : undefined)
                  },
                  {field: "email", title: "email",
                    render: row => (row ? 
                    <AnchorLink to={`/apps/${this.props.app.key}/agents/${row.id}`}>
                      {row.email}
                    </AnchorLink>
                   : undefined)
                  },
                  {field: "name", title: "name"},
                  {field: "signInCount", title: "signInCount"},
                  {field: "lastSignInAt", title: "lastSignInAt",
                    render: row => (row.lastSignInAt ? 
                      <Tooltip title={row.lastSignInAt}>
                        <Moment fromNow>
                          {row.lastSignInAt}
                        </Moment>
                      </Tooltip> : null
                    )
                  },
                  {field: "invitationAcceptedAt", title: "invitationAcceptedAt",
                    render: row => (row.invitationAcceptedAt ? 
                      <Tooltip title={row.invitationAcceptedAt}>
                        <Moment fromNow>
                          {row.invitationAcceptedAt}
                        </Moment> 
                      </Tooltip> : null
                    )
                  },
                ]}
                defaultHiddenColumnNames={[]}
                tableColumnExtensions={[
                  { columnName: 'email', width: 250 },
                  { columnName: 'id', width: 10 },
                  { columnName: 'avatar', width: 55 },
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

class NonAcceptedAppUsers extends React.Component {
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
    graphql(INVITE_AGENT, {
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
    })
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
                      <Button onClick={this.close} color="secondary">
                        Cancel
                      </Button>

                      <Button onClick={this.sendInvitation} 
                        color="primary">
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
    graphql(PENDING_AGENTS, {appKey: this.props.app.key, }, {
      success: (data)=>{
        this.setState({
          collection: data.app.notConfirmedAgents, 
          loading: false
        })
      },
      error: ()=>{

      }
    })
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
                  data={this.state.collection}
                  search={this.search}
                  loading={this.state.loading}
                  disablePagination={true}
                  columns={[
                    {field: "email", title: "email"},
                    {field: "name", title: "name"},
                    {field: "invitationAcceptedAt", title: "invitationAcceptedAt",
                      render: row => (row.invitationAcceptedAt ? 
                        <Tooltip title={row.invitationAcceptedAt}>
                          <Moment fromNow>
                            {row.invitationAcceptedAt}
                          </Moment>
                        </Tooltip> : null
                      )
                    },
                    {field: "invitationSentAt", title: "invitationSentAt",
                      render: row => (row.invitationSentAt ? 
                        <Tooltip title={row.invitationSentAt}>
                          <Moment fromNow>
                            {row.invitationSentAt}
                          </Moment>
                        </Tooltip> : null
                      )
                    },
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


export default withRouter(connect(mapStateToProps)(withStyles(styles)(TeamPage)))
