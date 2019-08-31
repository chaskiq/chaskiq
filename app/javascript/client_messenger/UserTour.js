import React, {Component} from 'react'
import DraftRenderer from '../src/textEditor/draftRenderer'
import DanteContainer from '../src/textEditor/editorStyles'
import theme from '../src/textEditor/theme'
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'

import Tooltip from './tour/tooltip'

import Joyride, { 
  ACTIONS, 
  EVENTS, 
  STATUS, 
  BeaconRenderProps, 
  TooltipRenderProps,
} from 'react-joyride';

export default class UserTours extends Component {
  render(){
    return this.props.tours.length > 0 ?
     <UserTour 
      tour={this.props.tours[0]} 
      events={this.props.events}
    /> 
     : null
  }
}

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


class UserTour extends Component {

  state = {
    run: true
  }

  componentDidMount(){
    this.getTour()
  }

  getTour = ()=>{

  }

  prepareJoyRidyContent = ()=>{
      return this.props.tour.steps.map((o, index)=>{
        o.disableBeacon = index === 0
        o.content = <DraftRenderer
                        raw={JSON.parse(o.serialized_content)}
                      />
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
      this.registerEvent()
    }

    console.groupCollapsed(type);
    console.log(data); //eslint-disable-line no-console
    console.groupEnd();
  };

  registerEvent = ()=>{
    this.props.events && this.props.events.perform("track_tour_finish", 
      {campaign_id: this.props.tour.id}   
    )
  }

  renderTour = ()=>{
    
    if(this.props.tour.steps && this.props.tour.steps.length > 0){
      return <Joyride
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
                  />
                
              
      } else {
        return null 
      }
    
  }

  render(){
    return (this.renderTour())
  }
}

const Beacon = (props)=>{
  return <ThemeProvider 
        theme={ theme }>
        <DanteContainer>
          {props.children}
        </DanteContainer>
      </ThemeProvider> 
}




function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 18 18"
    >
      <path
        fill="#333"
        d="M8.14 9.003L.171 17.026a.573.573 0 000 .807.562.562 0 00.8 0L9 9.749l8.028 8.084a.562.562 0 00.8 0 .573.573 0 000-.807L9.862 9.003l7.973-8.03a.573.573 0 000-.806.564.564 0 00-.801 0L9 8.257.967.166a.564.564 0 00-.801 0 .573.573 0 000 .807l7.973 8.029z"
      />
    </svg>
  );
}

// https://github.com/gilbarbara/react-joyride/blob/5679a56a49f2795244c2b4c5c641526a58602a52/src/components/Tooltip/Container.js
