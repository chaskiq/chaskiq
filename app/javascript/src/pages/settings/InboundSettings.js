import React, {Component, useState} from 'react'
import {
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Divider,
  Grid,
  RadioGroup,
  Radio,
  Avatar,
  Button
} from '@material-ui/core'

import Moment from 'react-moment';
import SegmentManager from '../../components/segmentManager'
import { parseJwt, generateJWT } from '../../components/segmentManager/jwt'

import { PREDICATES_SEARCH} from '../../graphql/mutations'
import graphql from '../../graphql/client'
import gravatar from '../../shared/gravatar'

export default function InboundSettings({settings, update}){
  const [state, setState] = React.useState({
    enable_inbound: true,
    visitors_enabled: true,
    users_enabled: true,
    users_radio: "all",
    visitorsPredicates: [],
    visitors_radio: "all",
    usersPredicates: [],
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  function setPredicates(name, value){
    setState({ ...state, [name]: value });
  }

  function handleSubmit(){
    const {
      enable_inbound, users_radio, usersPredicates, 
      visitors_radio, visitors_enabled, visitorsPredicates
    } = state

    const data = {
      app: {
        inbound_settings: {
          enabled: enable_inbound,
          users: {
            enabled_segment: users_radio,
            predicates: usersPredicates
          },
          visitors: {
            enabled_segment: visitors_radio,
            predicates: visitorsPredicates
          }
        }
      }
    } 
    update(data)
  }

  return (

    <div>
    
      <Typography variant={"h4"}>
        Control inbound conversations and the launcher
      </Typography> 

      <Typography variant={"overline"}>
        Control who can send you messages and where they see the launcher
      </Typography>

      <Typography variant={"h5"}>
        New conversations button
      </Typography>
    
      <Grid container>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.enable_inbound}
              onChange={handleChange('enable_inbound')}
              value={state.enable_inbound}
              color="primary"
            />
          }
          label="Let people start new inbound conversations with you"
        />
      </Grid>

      <Typography variant={"caption"}>
        When this is turned off, people can only reply to the outbound messages  you send.
      </Typography>

      <Divider/>

      <Box mb={2} mt={2}>
        <Typography variant={"h5"}>
          visibility
        </Typography>
      </Box>

      <Typography variant={"body1"}>
        Control who sees the standard Messenger launcher on your website.
      </Typography>

      <Typography variant={"overline"}>
        Any messages you send will still be delivered.
      </Typography>

      <Typography variant={"body1"}>
        On the web, show the standard Messenger launcher to:
        Users
      </Typography>

      <Divider/>

      <Box mb={2} mt={2}>
        <AppSegmentManager 
          app={settings} 
          label={"Users"}
          namespace={"users"}
          all={"All Users"} 
          checked={state.users_enabled}
          updateChecked={handleChange}
          predicates={state.usersPredicates}
          setPredicates={setPredicates}
          radioValue={state.users_radio}
          some={"Users who match certain data"} 
        />
      </Box>

      <Divider/>

      <Box mb={2} mt={2}>
        <AppSegmentManager 
          app={settings} 
          label={"Visitors"}
          all={"All Visitors"} 
          namespace="visitors"
          checked={state.visitors_enabled}
          updateChecked={handleChange}
          predicates={state.visitorsPredicates}
          setPredicates={setPredicates}
          radioValue={state.visitors_radio}
          some={"Visitors who match certain data"} 
        />
      </Box>

      <Typography variant="caption">
        This doesn’t affect the outbound messages you send.
      </Typography>

      <Grid container>
      <Button onClick={handleSubmit}
        variant={"contained"} color={"primary"}>
        Save
      </Button>
      </Grid>

    </div>
  )
}


function AppSegmentManager({
  app, 
  label, 
  all, 
  some, 
  checked, 
  updateChecked, 
  namespace,
  predicates,
  setPredicates,
  radioValue
}){

  //const [checked, setChecked]= useState(checked)
  //const [radioValue, setRadioValue] = useState("all")
  //const [predicates, setPredicates] = useState([])
  
  function handleChange(e){
    updateChecked(e)
    //setChecked(!checked)
  }

  function handleChangeRadio(e){
    setPredicates(`${namespace}_radio`, e.target.value)
  }

  function updatePredicates(data, cb){
    setPredicates(`${namespace}Predicates`, data.segments)
    cb && cb()
  }

  return (

    <Grid container>

      <Grid item sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={updateChecked(`${namespace}_enabled`)}
              value={checked}
              color="primary"
            />
          }
          label={label}
        />
      </Grid>

      <Grid item={6}>
        <RadioGroup
          //aria-label="gender"
          //name="gender1"
          //className={classes.group}
          disabled={!checked}
          value={radioValue}
          onChange={handleChangeRadio}
        >

          <FormControlLabel 
            disabled={!checked}
            value="all"
            control={<Radio />} 
            label={all}
          />

          <FormControlLabel 
            disabled={!checked}
            value="some"
            control={<Radio />} 
            label={some}
          />
          

        </RadioGroup>
      </Grid>

      <Grid item sm={12}>
        {
          checked && radioValue === "some" ?
          <AppSegment
            app={app}
            data={{ segments: predicates }}
            updateData={updatePredicates} 
          /> : null
        }
      </Grid>

    </Grid>

  )
}


class AppSegment extends Component {

  constructor(props) {
    super(props)
    this.state = {
      jwt: null,
      app_users: [],
      search: false,
      meta: {}
    }
  }
  componentDidMount() {
    /*this.props.actions.fetchAppSegment(
      this.props.app.segments[0].id
    )*/
    
    this.search()
  }

  updateData = (data, cb) => {
    const newData = Object.assign({}, this.props.data, { segments: data.data })
    this.props.updateData(newData, cb ? cb() : null)
  }

  updatePredicate = (data, cb) => {
    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  addPredicate = (data, cb) => {

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.props.data.segments.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if (cb)
      cb(jwtToken)

    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt)))
  }

  deletePredicate(data) {
    const jwtToken = generateJWT(data)
    this.setState({ jwt: jwtToken }, () => this.updateData(parseJwt(this.state.jwt), this.search))
  }

  search = (page) => {

    this.setState({ searching: true })
    // jwt or predicates from segment
    //console.log(this.state.jwt)
    const data = this.state.jwt ? parseJwt(this.state.jwt).data : this.props.data.segments
    const predicates_data = {
      data: {
        predicates: data.filter((o) => o.comparison)
      }
    }

    graphql(PREDICATES_SEARCH, { 
      appKey: this.props.app.key,
      search: predicates_data,
      page: page || 1,
      per: 5,
    },{
      success: (data) => { 
        const appUsers = data.predicatesSearch.appUsers
        this.setState({
          app_users: appUsers.collection,
          meta: appUsers.meta,
          searching: false
        })
      },
      error: (error) => {
        debugger
      }
    })
  }

  showUserDrawer = (o)=>{
    this.props.dispatch(
      toggleDrawer({ rightDrawer: true }, ()=>{
        this.props.dispatch(getAppUser(o.id))
      })
    )
  }

  render() {
    return <SegmentManager {...this.props}
      loading={this.state.searching}
      predicates={this.props.data.segments}
      meta={this.state.meta}
      collection={this.state.app_users}
      updatePredicate={this.updatePredicate.bind(this)}
      addPredicate={this.addPredicate.bind(this)}
      deletePredicate={this.deletePredicate.bind(this)}
      search={this.search.bind(this)}

      loading={this.props.searching}
      columns={[

        {name: 'id', title: 'id', hidden: true},
        {field: 'email', title: 'email', 
          render: row => (row ? 

            <div onClick={(id)=> this.showUserDrawer(row) }>
              
                <div 
                  //className={classes.margin} 
                  color={row.online ? "primary" : 'secondary' }
                  variant="dot">
                  <Avatar
                    name={row.email}
                    size="medium"
                    src={gravatar(row.email)}
                  />
                </div>
              

              <Typography>{row.name || row.displayName}</Typography>
              
            </div>

           : undefined)
        },
        {field: 'lastVisitedAt', 
          title: 'lastVisitedAt',
          render: row => (row ? <Moment fromNow>
                                        {row.lastVisitedAt}
                                      </Moment> : undefined)
        },
        {field: 'state', title: 'state'},
        {field: 'online', title: 'online'},
        {field: 'lat',  title: 'lat'},
        {field: 'lng',  title: 'lng'},
        {field: 'postal', title: 'postal'},
        {field: 'browser', title: 'browser'},
        {field: 'referrer', title: 'referrer'},
        {field: 'os', title: 'os'},
        {field: 'osVersion', title: 'osVersion'},
        {field: 'lang', title: 'lang'},

      ]}

      defaultHiddenColumnNames={
        ['id', 
        'state', 
        'online', 
        'lat', 
        'lng', 
        'postal',
        'browserLanguage', 
        'referrer', 
        'os', 
        'osVersion',
        'lang'
        ]}
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
      //toggleMapView={this.toggleMapView}
      //map_view={this.state.map_view}
      //enableMapView={true}
    >
      { /*
        this.state.jwt ?
          <Button isLoading={false}
            appearance={'link'}
            onClick={this.handleSave}>
            <i className="fas fa-chart-pie"></i>
            {" "}
            Save Segment
          </Button> : null
      */
      }

    </SegmentManager>
  }
}