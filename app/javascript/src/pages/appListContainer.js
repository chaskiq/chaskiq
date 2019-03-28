import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import Button, { ButtonGroup } from '@atlaskit/button';


export default class AppListContainer extends Component {

  state = {
    apps: []
  }

  componentDidMount(){
    axios.get("/apps.json")
    .then( (response)=> {
      this.setState({apps: response.data.collection}, ()=>{ 
      })
    })
    .catch( (error)=> {
      console.log(error);
    });

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

              <ButtonGroup>
                {
                  this.state.apps.map((o)=> (
                    <Button key={o.id}
                      isLoading={false} 
                      onClick={()=> this.props.history.push(`/apps/${o.id}`)}>
                      <i className="fas fa-list"></i>
                      {" "}
                      <b>{o.name}</b> | {o.id}
                    </Button>
                  )

                )}
              </ButtonGroup>

            </ContentWrapper>
  }
}