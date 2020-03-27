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


import Joyride, { 
  ACTIONS, 
  EVENTS, 
  STATUS, 
  BeaconRenderProps, 
  TooltipRenderProps,
} from 'react-joyride';

const NewEditorStyles = styled('div')`
  
  display: flex;

  button.inlineTooltip-button.scale {
    background: #fff;
  }

  button.inlineTooltip-button.control {
    background: #fff;
  }

  .public-DraftEditorPlaceholder-root {
    font-size: inherit;
  }
`

export default class UserTours extends Component {
  render(){
    return this.props.tours.length > 0 ?
     <UserTour 
      tour={this.props.tours[0]} 
      events={this.props.events}
      domain={this.props.domain}
    /> 
     : null
  }
}


class UserTour extends Component {

  state = {
    run: true
  }

  componentDidMount(){
    this.registerOpen()
  }

  disableBody = target => disableBodyScroll(target)
  
  enableBody = target => enableBodyScroll(target)

  prepareJoyRidyContent = ()=>{
    return this.props.tour.steps.map((o, index)=>{
      o.selector = o.target
      o.disableBeacon = index === 0
      o.content = <EditorStylesExtend 
                    campaign={true} 
                    style={{
                      fontSize: '1em',
                      lineHeight: '1em'
                    }}>
                    <DraftRenderer
                        domain={this.props.domain}
                        raw={JSON.parse(o.serialized_content)}
                      />      
                  </EditorStylesExtend>

      return o
    })
  }

  handleJoyrideCallback = data => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    }
    else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false });
      this.registerEvent(status)
    }

    console.groupCollapsed(type);
    console.log(data); //eslint-disable-line no-console
    console.groupEnd();
  };

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

  renderTour = ()=>{
    
    if(this.props.tour.steps && this.props.tour.steps.length > 0){
      return <Tour
                  steps={this.prepareJoyRidyContent(this.state.steps)}
                  isOpen={this.state.run}
                  onRequestClose={ ()=> {
                    this.setState({ run: false }, ()=>{
                      this.registerEvent('closed')
                    });
                  }} 
                  showNavigation={true}
                  disableInteraction={true}
                  onAfterOpen={this.disableBody}
                  onBeforeClose={this.enableBody}
                />
            
      
              {/*<Joyride
                steps={this.prepareJoyRidyContent(this.props.tour.steps)}
                run={this.state.run}
                tooltipComponent={Tooltip}
                //beaconComponent={Beacon}
                debug={true}
                continuous
                scrollToFirstStep
                showProgress
                showSkipButton
                callback={this.handleJoyrideCallback}
                styles={{
                  options: {
                    zIndex: 10000,
                  }
                }}
              />*/}
                
              
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
