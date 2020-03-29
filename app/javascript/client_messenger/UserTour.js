import React, {Component} from 'react'
import DraftRenderer from './textEditor/draftRenderer'
import DanteContainer from './textEditor/editorStyles'
import {EditorStylesExtend} from './textEditor/index'
import theme from './textEditor/theme'
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'

import Tooltip from './tour/tooltip'

import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import GlobalStyle from './tour/globalStyle'

import Tour from 'reactour-emotion'

const Fade = styled.div`

    position: absolute; 
    bottom: 66px;
    height: 48px;
    width: 91%;
    pointer-events: none;

    background: -webkit-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    ); 
    background-image: -moz-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: -o-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
    background-image: -ms-linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 1) 100%
    );
`

const Button = styled.button`
  color: #2d3748!important;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.06)!important;
  padding-left: 1rem!important;
  padding-right: 1rem!important;
  padding-top: .5rem!important;
  padding-bottom: .5rem!important;
  font-weight: 600!important;
  border-width: 1px!important;
  border-radius: .25rem!important;
  border-color: #cbd5e0!important;
  background-color: #fff!important;
  padding: 0;
  line-height: inherit;
  color: inherit;
  cursor: pointer;
  background-color: transparent;
  background-image: none;
  padding: 0;
  -webkit-appearance: button;
  text-transform: none;
  overflow: visible;
  &:hover{
    background-color: #f7fafc!important;
  }
`


export default class UserTours extends Component {
  render(){
    return this.props.tours.length > 0 ?
     <UserTour 
      t={this.props.t}
      tour={this.props.tours[0]} 
      events={this.props.events}
      domain={this.props.domain}
    /> 
     : null
  }
}


class UserTour extends Component {

  state = {
    run: true,
    currentStep: 0,
    completed: false
  }

  componentDidMount(){
    this.registerOpen()
  }

  disableBody = target => disableBodyScroll(target)
  
  enableBody = target => enableBodyScroll(target)

  prepareJoyRidyContent = ()=>{
    const count = this.props.tour.steps.length
    return this.props.tour.steps.map((o, index)=>{
      o.selector = o.target
      o.disableBeacon = index === 0
      o.action = (a)=>{
          //last step
          if(count === index+1){
            if(this.state.completed) return
            
            this.setState({completed: true}, ()=>{
              this.registerEvent('finished')
            })
            
            console.log("yes shitit pop", o)
          }
      }
      o.content = <EditorStylesExtend 
                    campaign={true} 
                    style={{
                      fontSize: '1em',
                      lineHeight: '1em',
                      overflow: 'scroll',
                      maxHeight: '200px'
                    }}>
                    <DraftRenderer
                        domain={this.props.domain}
                        raw={JSON.parse(o.serialized_content)}
                      /> 
                    {/*<Fade/> */}  
                  </EditorStylesExtend>

      return o
    })
  }
  
  registerEvent = (status)=>{
    const path = `track_tour_${status}`
    this.props.events && this.props.events.perform(path, 
      {
        trackable_id: this.props.tour.id,
        trackable_type: 'Tour'
      }   
    )
  }

  registerOpen = ()=>{
    this.props.events && this.props.events.perform("track_open", 
      {
        trackable_id: this.props.tour.id,
        trackable_type: 'Tour'
      }   
    )
  }

  registerClose = ()=>{
    this.props.events && this.props.events.perform("track_close", 
      {
        trackable_id: this.props.tour.id,
        trackable_type: 'Tour'
      }   
    )
  }

  renderTour = ()=>{
    
    if(this.props.tour.steps && this.props.tour.steps.length > 0){
      return <Tour
                  steps={this.prepareJoyRidyContent(this.state.steps)}
                  isOpen={this.state.run}
                  onRequestClose={ ()=> {
                    this.setState({ run: false }, ()=>{
                      //this.registerEvent('skipped')
                      if(this.state.completed)
                        return
                      this.registerClose()
                    });
                  }} 
                  closeWithMask={false}
                  showButtons={
                    //this.state.currentStep < this.props.tour.steps.length
                    true
                  }
                  showNavigation={
                    //this.state.currentStep < this.props.tour.steps.length
                    true
                  }
                  disableInteraction={true}
                  onAfterOpen={this.disableBody}
                  onBeforeClose={this.enableBody}
                  lastStepNextButton={
                    <Button onClick={()=>{
                      this.setState({ run: false }, ()=>{
                        // it will be triggered anyway
                        //this.registerEvent('finished')
                      });
                    }}>
                      {
                        this.props.t(`tours.done`)
                      }
                    </Button>
                  }
                />        
      } else {
        return null 
      }
  }

  render(){
    return (
      <React.Fragment>
        <GlobalStyle/>
        <ThemeProvider theme={ theme }>
          {this.renderTour()}
        </ThemeProvider>      
      </React.Fragment>
    )
  }
}
