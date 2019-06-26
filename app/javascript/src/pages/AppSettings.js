import React, {Component} from "react"
import {
  Route,
  Link
} from 'react-router-dom'
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import styled from 'styled-components'
import axios from 'axios'
import serialize from 'form-serialize'
import {
  Paper, 
  Button, 
  Typography, 
  Grid
} from '@material-ui/core';
import FieldRenderer from '../shared/FormFields'
import graphql from "../graphql/client";
import { APP } from "../graphql/queries"
import { PREDICATES_SEARCH, UPDATE_APP } from '../graphql/mutations'
import { toSnakeCase } from '../shared/caseConverter'
import { withStyles } from '@material-ui/core/styles';

import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

import {
  FormControlLabel,
  Checkbox
} from "@material-ui/core"

const styles = theme => ({
  root: {
    padding: '5em',
    margin: '5em',
  },
  formControl: {
    margin: theme.spacing.unit,
    //minWidth: 120,
    //maxWidth: 300,
    width: '100%'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
});

class SettingsForm extends Component {

  constructor(props){
    super(props)
    this.state = {
      selected: 0,
      data: {},
      errors: {}
    }    
  }

  url = ()=>{
    const id = this.props.match.params.id
    return this.props.isNew ? 
    `/apps.json` : 
    `/apps/${this.props.store.app.key}.json`
  }

  tabs = ()=>{
    var b = []
    return b    
  }

  onSubmitHandler = (e) => {
    e.preventDefault()
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data           = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){
    return <ContentWrapper>
            {
              /*<Tabs
                  tabs={this.tabs()}
                  {...this.props}
                  selected={this.state.selected}
                  onSelect={(tab, index) => { 
                    this.setState({selected: index})
                    console.log('Selected Tab', index + 1)
                  }
                }
              />*/
            } 
        

            <Paper className={this.props.classes.root}>


              <FormControlLabel
                control={
                  <Checkbox 
                    icon={<FavoriteBorder />} 
                    checkedIcon={<Favorite />} 
                    value="checkedH" 
                  />
                }
                label={this.props.app.state}
              />

              <form
                name="create-repo"
                onSubmit={this.onSubmitHandler.bind(this)}
                ref={form => {
                  this.formRef = form;
                }}>

                <Typography variant="h6" gutterBottom>
                  App settings
                </Typography>

                <Grid container spacing={3}>
                  {
                    this.props.data.configFields.map((field) => {

                      return <Grid item 
                                xs={field.grid.xs} 
                                sm={field.grid.sm}>
                                <FieldRenderer 
                                  namespace={'app'} 
                                  data={field}
                                  props={this.props} 
                                  errors={this.props.data.errors || {} }
                                 />
                             </Grid>
                    })
                  }


                <Grid item xs={12} sm={6}>
                  <Button variant="contained" color="primary" type="submit">
                    Save settings
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button appearance="subtle">
                    Cancel
                  </Button>
                </Grid>

                </Grid>

              </form>

            </Paper>

    </ContentWrapper>
  }

}



class AppSettingsContainer extends Component {

  constructor(props){
    super(props)
    /*this.state = {
      app: null
    }*/
  }


  componentDidMount(){
    //this.fetchApp()
  }

  url = ()=>{
    return `/apps/${this.props.match.params.appId}.json`
  }

  fetchApp = ()=>{
    graphql(APP, { appKey: this.props.match.params.appId}, {
      success: (data)=>{
        this.setState({ app: data.app })
      },
      errors: (error)=>{
        console.log(error)
      }
    })
  }

  // Form Event Handlers
  update = (data) => {
    this.props.dispatch(
      this.props.updateApp(data.app, (d)=>{
        debugger
        console.log(d)
      })
    )
    /*graphql(UPDATE_APP, { 
      appKey: this.props.match.params.appId,
      appParams: data.app
    }, {
      success: (data)=>{
        this.setState({ app: data.appsUpdate.app, errors: data.appsUpdate.errors }, () => {
          //this.props.updateData(response.data)
        })
      }
    })*/
  };

  render(){
    return <div>
        {
          this.props.app ?
          <SettingsForm
            currentUser={this.props.currentUser}
            data={this.props.app}
            update={this.update.bind(this)}
            fetchApp={this.fetchApp}
            classes={this.props.classes}
            {...this.props}/> : null
        }
        </div>
  }
}



export default withStyles(styles, { withTheme: true })(AppSettingsContainer);



