import React, {Component} from 'react'
import styled from '@emotion/styled'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import graphql from "../graphql/client"
import {
  UPDATE_CAMPAIGN,   
  CREATE_URL_UPLOAD,
  CREATE_DIRECT_UPLOAD
} from '../graphql/mutations'

import {getFileMetadata, directUpload} from '../shared/fileUploader' //'../shared/fileUploader'

import DraftRenderer from '../textEditor/draftRenderer'
import DanteContainer from '../textEditor/editorStyles'
import theme from '../textEditor/theme'
import { ThemeProvider } from 'emotion-theming'
import DeleteForeverRounded  from '@material-ui/icons/DeleteForeverRounded'

import IconButton from '@material-ui/core/IconButton'
import Link from '@material-ui/core/Link'
import StyledFrame from '../../client_messenger/styledFrame'

// INTERNAL APP TOUR
const StepContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
`
const ConnectorStep = styled.div`
  width: 60px;
  heigth: 60px;
  border: 1px solid #ccc;
`

const StepBody = styled.div`
  background: #fff;
  max-height: 148px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,.05);
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 5px;
  overflow: hidden;
  max-width: 140px;
  padding: 10px;
  position: relative;
  .MuiIconButton-root{
    position:absolute;
    top: -7px;
    right: -7px;
  }
`

const StepHeader = styled.div`
  padding: 16px 24px;
`

const StepMessage = styled.div`

  .contentWrap{
    &:before {
      content:'';
      width:100%;
      height:100%;    
      position:absolute;
      left:0;
      top:31px;
      background:linear-gradient(transparent 57px, white);
    }
  }

`
const StepsContainer = styled.div`
  //width: 50%;
  overflow:scroll;
  display: flex;
`

const Body = styled.div`
  padding: 30px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NewStepContainer = styled.div`
  background-color: #ebebeb;
  border-radius: 4px;
  min-width: 205px;
  height: 150px;
  border: 1px solid #ccc;
`

const NewStepBody = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

window.__CHILD_WINDOW_HANDLE_2 = null


class TourManager extends Component {
  
  state = {
    enabledTour: false
  }


  componentDidMount() {
    window.TourManagerEnabled = () => {
      return this.state.enabledTour //alert("oaoaoaoa")
    }

    window.TourManagerMethods = {
      update: this.updateData,
      getSteps: ()=> this.props.data.steps
    }

    // events received from child window & pingback
    window.addEventListener('message', (e)=> {
      if(e.data.type === "ENABLE_MANAGER_TOUR")
        window.__CHILD_WINDOW_HANDLE_2.postMessage(
          { 
            tour: this.props.data, 
            tourManagerEnabled: true
          }, 
          "*"
        );

      if(e.data.type === "GET_TOUR")
        window.__CHILD_WINDOW_HANDLE_2.postMessage({
          type: "GET_TOUR" , 
          data: this.props.data
        }, "*");

      if(e.data.type === "SAVE_TOUR")
        this.updateData(e.data.steps, ()=>{
          window.__CHILD_WINDOW_HANDLE_2.postMessage({
            type: "GET_TOUR" , 
            data: this.props.data
          }, "*");
        })

      if(e.data.type === "UPLOAD_IMAGE"){
        this.handleDirectUpload(e.data.file, e.data.input)
      }

      if(e.data.type === "URL_IMAGE"){
        this.handleUrlUpload(e.data.file, e.data.input)
      }
    } , false);
  }

  componentWillUnmount() {
    window.TourManagerEnabled = null
    window.TourManagerMethods = null
  }

  updateData = (data, cb)=>{
    const params = {
      appKey: this.props.app.key,
      id: this.props.data.id,
      campaignParams: {
        steps: data
      }
    }

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        this.props.updateData(data.campaignUpdate.campaign, null)
        if(cb) cb()
        //this.setState({ status: "saved" })
      },
      error: () => {

      }
    })
  }

  handleUrlUpload = (url)=>{
    graphql(CREATE_URL_UPLOAD, {url: url} , {
      success: (data)=>{
        const {signedBlobId, headers, url, serviceUrl} = data.createUrlUpload.directUpload
        //imageBlock.uploadCompleted(serviceUrl)
        //this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
        //this.setDisabled(false)
        window.__CHILD_WINDOW_HANDLE_2.postMessage({
          type: "URL_UPLOAD_COMPLETED" , 
          data: {signedBlobId, headers, url, serviceUrl}
        }, "*");
      },
      error: ()=>{
        debugger
      }
    })
  }

  handleDirectUpload = (file, input)=>{
    graphql(CREATE_DIRECT_UPLOAD, input, {
      success: (data)=>{
        const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
        console.log("DRECT", signedBlobId, headers, url, serviceUrl)
        directUpload(url, JSON.parse(headers), file).then(
          () => {

            window.__CHILD_WINDOW_HANDLE_2.postMessage({
              type: "UPLOAD_COMPLETED" , 
              data: {signedBlobId, headers, url, serviceUrl}
            }, "*");
            
            //this.setDisabled(false)
            //imageBlock.uploadCompleted(serviceUrl)
            //this.props.uploadHandler({signedBlobId, headers, url, serviceUrl, imageBlock})
        });
      },
      error: (error)=>{
        debugger
        this.setDisabled(false)
        console.log("error on signing blob", error)
      }
    })
  }

  openTourManager = ()=>{
    this.setState({
      enabledTour: true
    }, () => {

      const options = 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=700,height=500,left=200,top=100'
      window.__CHILD_WINDOW_HANDLE_2 = window.open(
        `${this.props.data.url}`, 
        'win', 
        options
      );
      //'_blank' )

      /*setTimeout(() => {
        __CHILD_WINDOW_HANDLE_2.postMessage(
          {tour: this.props.data, tourManagerEnabled: true}, 
          "*"
        );
        
      }, 8000);*/



      /*var winFeature =
        'location=no,toolbar=no,menubar=no,scrollbars=yes,resizable=yes';
      open(`/tester/${this.props.app.key}`, 'null', winFeature)*/
      //open(`/tester/${this.props.app.key}`)
      //open(`${this.props.data.url}`)
    })
  }

  render(){
    return <Body>
            <StepsContainer>
              {
                this.props.data.steps && this.props.data.steps.map((o) => {
                  return <TourStep step={o}
                    key={o.target}>
                    //removeItem={this.removeItem}
                    //enableEditMode={this.enableEditMode}>
                  </TourStep>
                }
                )
              }

              <NewTourStep
                openTourManager={this.openTourManager}>
              </NewTourStep>

            </StepsContainer>
          </Body>
  }
}


class NewTourStep extends Component {
  enableSelection = (e) => {
    e.preventDefault()
    this.props.openTourManager()
  }
  render() {
    return <NewStepContainer>
      <NewStepBody>
        <Link href="#" onClick = {this.enableSelection}>new +</Link>
      </NewStepBody>
    </NewStepContainer>
  }
}

class TourStep extends Component {

  removeItem = (e)=>{
    e.preventDefault()
  }

  enableEditMode = (e)=>{
    e.preventDefault()

  }

  render(){
    return <StepContainer onClick={this.enableEditMode}>
           <StepBody>

              <IconButton onClick={this.removeItem}>
                <DeleteForeverRounded/>
              </IconButton>

              <StepHeader></StepHeader>

              <StepMessage>

                <div className="contentWrap">

                  <ThemeProvider 
                    theme={ theme }>
                    
                    <DanteContainer>
                      <DraftRenderer
                        raw={JSON.parse(this.props.step.serialized_content)}
                      />
                    </DanteContainer>

                  </ThemeProvider>
                
                </div>
              </StepMessage>
           </StepBody>
           <ConnectorStep/>
          </StepContainer>
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

export default withRouter(connect(mapStateToProps)(TourManager))

