import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import AppCard from '../components/AppCard'

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

    this.updateNavLinks()
  }

  updateNavLinks = ()=>{
    this.props.updateNavLinks(this.props.initialNavLinks)
  }

  render(){
     return <ContentWrapper>

              <PageTitle>
                Apps
              </PageTitle>

           
                {
                  this.state.apps.map((o)=> (
                    <AppCard 
                      app={o} 
                      onClick={() => this.props.history.push(`/apps/${o.key}`)}
                    />
                    
                  )

                )}
           

            </ContentWrapper>
  }
}