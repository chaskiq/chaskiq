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
import { APPS } from "../graphql/queries"

export default class AppListContainer extends Component {

  state = {
    apps: []
  }

  componentDidMount(){

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
                   
                      <Typography variant={"h4"} gutterBottom>
                        Your applications
                      </Typography>
                      
                      <Grid container spacing={2}>
                      {
                        this.state.apps.map((o)=> (
                          <Grid item xs={12} md={4}>
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