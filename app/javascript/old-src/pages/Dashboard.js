import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider'
//import Chart from './Chart';
import moment from 'moment'

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import DashboardCard from '../components/dashboard/card'
import Title from '../components/dashboard/title';
import Progress from '../shared/Progress'


import HeatMap from '../components/charts/heatMap'
import Pie from '../components/charts/pie'
import Count from '../components/charts/count'

import {DASHBOARD} from "../graphql/queries"
import graphql from '../graphql/client'

import {setCurrentSection} from '../actions/navigation'
import { withRouter } from 'react-router-dom'
import Content from '../components/Content'
import { connect } from 'react-redux'



const styles = theme => ({
  paperll: {
    maxWidth: 936,
    //marginTop: '2em',
    //marginBottom: '2em',
    margin: 'auto',
    //overflow: 'hidden',
    //marginBottom: 20,
  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    fontSize: theme.typography.fontSize,
  },
  block: {
    display: 'block',
  },
  addUser: {
    marginRight: theme.spacing(1),
  },
  contentWrapper: {
    margin: '40px 16px',
  },
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },

  content: {
    flexGrow: 1,
    height: '100vh',
    //overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },

});

function Dashboard(props) {
  const { classes, app, dispatch } = props;

  React.useEffect(()=>{
    dispatch(
      setCurrentSection("Dashboard")
    )
  }, [])

  const initialData =  {
    loading: true,
    from: moment().add(-1, 'week'),
    to: moment(), //.add(-1, 'day')
  }

  const [dashboard, setDashboard] = React.useState(initialData)

  const bull = <span className={classes.bullet}>•</span>;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <Content>

      <div className={classes.contentWrapper}>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Chart */}


            <Grid item xs={12} md={12} lg={12}>

              <DashboardItem
                chartType={"app_packages"} 
                dashboard={dashboard}
                app={app} 
                label={I18n.t('dashboasrd.user_country')}
                kind={'app_packages'}
                classes={classes}
                styles={{}}
              />
            
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper className={classes.paper}>
                <DashboardItem
                  chartType={"count"} 
                  dashboard={dashboard} 
                  app={app} 
                  kind={"first_response_time"}
                  label={I18n.t('dashboard.response_avg')}
                  appendLabel={"Hrs"}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper className={classes.paper}>
                <DashboardItem
                  chartType={"count"} 
                  dashboard={dashboard} 
                  app={app} 
                  kind={"opened_conversations"}
                  label={I18n.t('dashboard.new_conversations')}
                  appendLabel={""}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper className={classes.paper}>
                <DashboardItem
                  chartType={"count"} 
                  dashboard={dashboard} 
                  app={app} 
                  kind={"solved_conversations"}
                  label={I18n.t('dashboard.resolutions')}
                  appendLabel={""}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper className={classes.paper}>
                <DashboardItem
                  chartType={"count"} 
                  dashboard={dashboard} 
                  app={app} 
                  kind={"incoming_messages"}
                  label={I18n.t('dashboard.incoming_messages')}
                  appendLabel={""}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>
                {/*<Chart />*/}
                <Title>Visit activity</Title>
                 <DashboardItem
                    chartType={"heatMap"} 
                    dashboard={dashboard} 
                    app={app} 
                    kind={"visits"}
                  />
              </Paper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>
                <DashboardCard title={"Users browser"}>

                  <DashboardItem
                    chartType={"pie"} 
                    dashboard={dashboard}
                    app={app} 
                    label={I18n.t('dashboasrd.browser')}
                    kind={'browser'}
                  />
                
                </DashboardCard>
                
              </Paper>
            </Grid>
  
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>
              <DashboardCard title={"Lead Os"}>
                  <DashboardItem
                    chartType={"pie"} 
                    dashboard={dashboard}
                    app={app} 
                    label={I18n.t('dashboasrd.lead_os')}
                    kind={'lead_os'}
                  />
                </DashboardCard>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>
              <DashboardCard title={"User Os"}>
                  <DashboardItem
                    chartType={"pie"} 
                    dashboard={dashboard}
                    app={app} 
                    label={I18n.t('dashboasrd.user_os')}
                    kind={'user_os'}
                  />
                </DashboardCard>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>
              <DashboardCard title={"User country"}>
                  <DashboardItem
                    chartType={"pie"} 
                    dashboard={dashboard}
                    app={app} 
                    label={I18n.t('dashboasrd.user_country')}
                    kind={'user_country'}
                  />
                </DashboardCard>
              </Paper>
            </Grid>

          </Grid>
        </Container>
        {/*<MadeWithLove />*/}
      </main>

      </div>

    </Content>
  );
}


function DashboardItem(
  {
    app, 
    kind, 
    dashboard,
    chartType,
    label,
    appendLabel,
    classes,
    styles
  }){

  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{
    getData()} 
  , [])

  function getData(){

    graphql(DASHBOARD, {
      appKey: app.key,
      range: {
          from: dashboard.from,
          to: dashboard.to
        },
        kind: kind
      }, {
      success: (data)=>{
        setData(data.app.dashboard)
        setLoading(false)
      },
      error: (err)=>{
        setLoading(false)
        debugger
      }
    })
  }

  function renderChart(){
    switch (chartType) {
      case "heatMap":
        return <HeatMap 
          data={data}
          from={dashboard.from}
          to={dashboard.to}
        />

      case "pie":
        return  <Pie 
          data={data}
          from={dashboard.from}
          to={dashboard.to}
        />
      case "count":
        return  <Count 
          data={data}
          from={dashboard.from}
          to={dashboard.to}
          label={label}
          appendLabel={appendLabel}
        />
      case "app_packages":
        return <DashboardAppPackages 
                data={data}
                dashboard={dashboard}
                classes={classes}
               />
      default:
        return <p>no chart type</p>;
    }
  }

  return (
    <div style={styles || {height: '140px'} }>

      {
        loading && <Progress/>
      }
      {
        !loading && renderChart()
      }
    </div>
  )
}

function DashboardAppPackages(props){
  const packages  = props.data
  return (
    <div>
      {
        packages && packages.map((o)=>( 
          <DashboardAppPackage 
            package={o} 
            dashboard={props.dashboard}
            classes={props.classes} 
          /> 
        ))
      }
    </div>
  )
}

function DashboardAppPackage(props){
  const dashboard = props.dashboard
  const pkg  = props.package
  const data = pkg.data
  const classes = props.classes

  return (
    <Paper className={classes.paper}>

    <Grid container spacing={3}>
      <Grid item>
        <img src={pkg.icon} width={64}/>
      </Grid>

      <Grid item>
        <Typography variant="h5">
          {pkg.name}: {data.title} 
        </Typography>

        <Typography variant="overline">
          {data.subtitle}
        </Typography>
      </Grid>
    </Grid>

    <Divider/>

      <Grid container spacing={3}>

        {
          data.values && data.values.map((v)=>{
            return <Grid item>
                      
                        <Count 
                          data={v.value}
                          from={dashboard.from}
                          to={dashboard.to}
                          label={v.label}
                          subtitle={`${v.value2}`}
                          //appendLabel={appendLabel}
                        />
                     
                    </Grid>
          })
        }

      </Grid>
    </Paper>
  )
}



Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};


function mapStateToProps(state) {

  const { auth, app } = state
  const { loading, isAuthenticated } = auth

  return {
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(withStyles(styles)(Dashboard)))