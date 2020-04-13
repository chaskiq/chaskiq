import React, {Component} from 'react'
import AppCard from '../components/AppCard'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import graphql from "../graphql/client"
import {LinkButton} from '../shared/RouterLink'
import AddIcon from '@material-ui/icons/Add'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {setCurrentSection} from '../actions/navigation'


import { APPS } from "../graphql/queries"

class AppListContainer extends Component {

  state = {
    apps: []
  }

  componentDidMount(){

    this.props.dispatch(
      setCurrentSection(null)
    )

    graphql(APPS ,{} ,{
      success: (data)=>{
        this.setState({ apps: data.apps })
      }, 
      error: (error)=>{

      }
    })

    /*
    axios.get("/apps.json")
    .then( (response)=> {
      this.setState({apps: response.data.collection}, ()=>{ 
      })
    })
    .catch( (error)=> {
      console.log(error);
    });*/

    //this.updateNavLinks()
  }

  render(){
     return <div>
              <ContentHeader title={"Apps"}/>
              
                <Container maxWidth="md">
                  <Box component="span" m={1}>

                    <Grid container spacing={2} justify={"space-between"}>
                   
                      <Grid item>
                      <Typography variant={"h4"} gutterBottom>
                        Your applications
                      </Typography>

                      </Grid>



                      <Grid item>
                      <LinkButton 
                        variant={'contained'} 
                        color={'primary'} 
                        onClick={()=> this.props.history.push(`/apps/new`)}>
                        <AddIcon />
                        {"Create new app"}
                      </LinkButton>
                      </Grid>

                    </Grid>

                      
                      <Grid container spacing={2}>
                      {
                        this.state.apps.map((o)=> (
                          <Grid 
                            key={`app-lst-item-${o.key}`} 
                            item xs={12} md={4}>
                            <AppCard 
                              app={o} 
                              onClick={() => this.props.history.push(`/apps/${o.key}`)}
                            />
                          </Grid>
                          
                        )
                      )}
                      </Grid>
                   
                  </Box>
                </Container>
             
            </div>

              
        
  }
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

export default withRouter(connect(mapStateToProps)(AppListContainer))