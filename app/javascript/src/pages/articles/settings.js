import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Paper,
        Grid,
        Divider,
        Chip,
        Select,
        MenuItem,
        Box,

        Table,
        TableHead,
        TableRow,
        TableCell,
        TableBody,

} from '@material-ui/core';

import {getFileMetadata, directUpload} from '../../shared/fileUploader'

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'
import {toSnakeCase} from '../../shared/caseConverter'
import FormDialog from '../../components/FormDialog'

import {
  CREATE_DIRECT_UPLOAD,
} from '../../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';
import serialize from 'form-serialize'

//import Loader from './loader'
import _ from "lodash"

import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import {setCurrentPage} from '../../actions/navigation'
import FieldRenderer from '../../shared/FormFields'
import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'
import langsOptions from '../../shared/langsOptions'



const styles = theme => ({

  paper: {
    margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  }
});


class Settings extends Component {

  state = {
    loading: true,
    tabValue: 0,
    settings: null,
    errors: []
  };

  titleRef = null
  descriptionRef = null
  switch_ref = null

  componentDidMount(){
    this.props.getSettings(()=> this.setState({loading: false}))
    this.props.dispatch(
      setCurrentPage('Help Center')
    )
  }

  updateState = (data)=>{
    this.setState(data)
  }

  uploadHandler = (file, kind)=>{

    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              let params = {}
              params[kind] = signedBlobId
              this.props.update({settings: params})
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }

  definitionsForSettings = () => {
    return [
      {
        name: "subdomain",
        hint: "documentation site subdomain",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },

      {
        name: "domain",
        hint: "documentation site custom domain",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "website",
        hint: "link to your website",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "googleCode",
        hint: "Google Analytics Tracking ID",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForAppearance = () => {
    return [
      {
        name: "color",
        type: 'color',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "logo",
        type: 'upload',
        handler: (file)=> this.uploadHandler(file, "logo"),
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "header_image",
        type: 'upload',
        handler: (file)=> this.uploadHandler(file, "header_image"),
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "facebook",
        startAdornment: "facebook/",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "twitter",
        startAdornment: "twitter/",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "linkedin",
        startAdornment: "linkedin/",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "credits",
        type: 'bool',
        hint: "Display a subtle link to the Chaskiq website",
        grid: { xs: 12, sm: 8 }
      },
    ]
  }

  definitionsForLang = () => {
    return [
      {
        name: "langs",
        type: 'select',
        multiple: true,
        options: langsOptions, 
        default: "es",
        hint: "Choose langs",
        grid: { xs: 12, sm: 8 }
      },
    ]
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Basic Setup" />
              <Tab textColor="inherit" label="Lang" />
              <Tab textColor="inherit" label="Appearance" />
            </Tabs>
  }

  renderTabcontent = ()=>{

    if(this.state.loading){
      return <p>loading...</p>
    }

    switch (this.state.tabValue){
      case 0:
        return <SettingsForm
                  title={"General app's information"}
                  //currentUser={this.props.currentUser}
                  data={this.props.settings}
                  update={this.props.update.bind(this)}
                  errorNamespace={"article_settings."}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForSettings}
                  errors={this.state.errors}
                  {...this.props}
               />

      case 1:
        return <div>

                <Box mb={2}>

                  <Typography variant="h5">
                    Localize your Help Center
                  </Typography>

                  <Typography variant="subtitle1">
                    Manage supported languages and customize your Help 
                    Center's header
                  </Typography>
                </Box>

                <LanguageForm
                  title={"Lang"}
                  settings={this.props.settings}
                  //currentUser={this.props.currentUser}
                  data={this.props.settings}
                  update={this.props.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForLang}
                  errors={this.state.errors}
                  {...this.props}
                />
              </div>
      case 2:
        return <SettingsForm
                  title={"Appearance settings"}
                  //currentUser={this.props.currentUser}
                  data={this.props.settings}
                  update={this.props.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForAppearance}
                  errors={this.state.errors}
                  {...this.props}
                />
      case 3:
        return <p>ddkd</p>
    }
  }


  render() {
    const {classes} = this.props
    return (
       <React.Fragment>

         <ContentHeader 
            title={ 'Help Center Settings' }
            tabsContent={ this.tabsContent() }
          />

          <Content>
            {this.renderTabcontent()}
          </Content>

        
      </React.Fragment>
    );
  }
}

class SettingsForm extends Component{

  formRef: any;

  onSubmitHandler = ()=>{
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){

    return (

      <form 
        onSubmit={this.onSubmitHandler.bind(this)}
        ref={form => {
        this.formRef = form;
      }}>
        
        <Box mb={2}>
        
          <Grid container spacing={3}>
            {
              this.props.definitions().map((field) => {

                return <Grid item
                          key={field.name} 
                          xs={field.grid.xs} 
                          sm={field.grid.sm}>
                          <FieldRenderer 
                            namespace={'settings'} 
                            data={field}
                            errorNamespace={this.props.errorNamespace}
                            props={{data: this.props.data }} 
                            errors={ this.props.errors }
                          />
                      </Grid>
              })
            }
          </Grid>
        
        </Box>

        <Grid container justify={"space-around"}>

          <Button appearance="subtle" variant={"outlined"}>
            Cancel
          </Button>
          <Button 
            onClick={this.onSubmitHandler.bind(this)}
            variant="contained" 
            color="primary">
            Save
          </Button>
        </Grid>

      </form>
    )
  } 
}

function LanguageForm({settings, update}){

  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLang, setSelectedLang] = React.useState(null)
  const formRef = React.createRef();

  function handleChange(value){
    const val = value.currentTarget.dataset.value
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)

    let next = {}
    next[`site_title_${val}`] = ""
    next[`site_description_${val}`] = ""

    const newData = Object.assign({}, data.settings, next)
    update({settings: newData})
    toggleDialog()
  }

  function renderLangDialog(){
    return isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Save Assigment rule"}
        formComponent={
          //!loading ?
            <form>

              <Select
                value={selectedLang}
                onChange={handleChange}
                inputProps={{
                  name: 'age',
                  id: 'age-simple',
                }}>

                {
                  langsOptions.map((o)=>(
                    <MenuItem value={o.value}>
                      {o.label}
                    </MenuItem> 
                  ))
                }
                
                
              </Select>

            </form> 
            //: <CircularProgress/>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={toggleDialog} color="primary">
              Cancel
            </Button>

            <Button //onClick={this.submitAssignment } 
              zcolor="primary"> 
              update
            </Button>

          </React.Fragment>
        }
        //actions={actions} 
        //onClose={this.close} 
        //heading={this.props.title}
        >
      </FormDialog>
    )
  }

  function toggleDialog(){
    setIsOpen(!isOpen)
  }

  function handleSubmit(){
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    update(data)
  }

  return (

    <div>

      <form ref={formRef}>

        <Button onClick={toggleDialog} variant={"outlined"}>
          Add language
        </Button>

        <Box mt={2} mb={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Locale</TableCell>
                <TableCell align="left">Title</TableCell>
                <TableCell align="left">Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.translations.map(row => (
                <TableRow key={row.locale}>
                  <TableCell component="th" scope="row">
                    {row.locale}
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      //id="standard-name"
                      label="Site Title"
                      defaultValue={row.site_title}
                      name={`settings[site_title_${row.locale}]`}
                      //className={classes.textField}
                      //value={values.name}
                      //onChange={handleChange('name')}
                      margin="normal"
                    />
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      //id="standard-name"
                      label="Site Description"
                      defaultValue={row.site_description}
                      name={`settings[site_description_${row.locale}]`}
                      //className={classes.textField}
                      //value={values.name}
                      //onChange={handleChange('name')}
                      margin="normal"
                    />
                  </TableCell>
                
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
        </Box>

        <Grid container alignContent={"flex-end"}>
          <Button onClick={handleSubmit} variant={"contained"} color={"primary"}>
            Submit
          </Button>        
        </Grid>

      </form>

      {renderLangDialog()}

    </div>
  )
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


export default withRouter(connect(mapStateToProps)(withStyles(styles)(Settings)))
