import React, {Component} from 'react'
import DraftRenderer from '../src/textEditor/draftRenderer'
import DanteContainer from '../src/textEditor/editorStyles'
import theme from '../src/textEditor/theme'
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'
import Joyride, { 
  ACTIONS, 
  EVENTS, 
  STATUS, 
  BeaconRenderProps, 
  TooltipRenderProps ,
  
} from 'react-joyride';

export default class UserTours extends Component {
  render(){
    return this.props.tours.length > 0 ?
     <UserTour tour={this.props.tours[0]} /> 
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
                    //callback={this.handleJoyrideCallback}
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


const TooltipBody = styled.div`
  background-color: rgb(255, 255, 255);
  border-radius: 5px;
  box-sizing: border-box;
  color: rgb(51, 51, 51);
  font-size: 16px;
  max-width: 100%;
  padding: 15px;
  position: relative;
  width: 380px;
`

const TooltipFooter = styled.div`
  align-items: center; 
  display: flex; 
  justify-content: flex-end;
  margin-top: 15px;
`;

const TooltipButton = styled.button`
  background-color: rgb(255, 0, 68);
  border: 0px;
  border-radius: 4px;
  color: rgb(255, 255, 255);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 8px;
  -webkit-appearance: none;
`

const TooltipCloseButton = styled.button`
  background-color: transparent;
  border: 0px;
  border-radius: 0px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 15px;
  -webkit-appearance: none;
  position: absolute;
  right: 0px;
  top: 0px;
`

const TooltipBackButton = styled.button`
  background-color: transparent;
  border: 0px;
  border-radius: 0px;
  color: rgb(255, 0, 68);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 8px;
  -webkit-appearance: none;
  margin-left: auto;
  margin-right: 5px;
`

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
const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  styles,
  isLastStep,
  size
}) => {
  const { back, close, last, next, skip } = step.locale;
  const output = {
    primary: close,
  };

  if (continuous) {
    output.primary = isLastStep ? last : next;

    if (step.showProgress) {
      output.primary = (
        <span>
          {output.primary} ({index + 1}/{size})
        </span>
      );
    }
  }

  return <TooltipBody {...tooltipProps}>
    {(step && step.title) && <div>{step.title}</div>}
    <div>

      <ThemeProvider 
        theme={ theme }>
        <DanteContainer>
          {step.content}
        </DanteContainer>
      </ThemeProvider> 
    
    </div>
    <TooltipFooter>
      {index > 0 && (
        <TooltipBackButton {...backProps}>
          back
        </TooltipBackButton>
      )}
      {continuous && (
        <TooltipButton {...primaryProps}>
          {output.primary}
        </TooltipButton>
      )}
      {!continuous && (
        <TooltipCloseButton {...closeProps}>
          <CloseIcon/>
        </TooltipCloseButton>
      )}
    </TooltipFooter>
  </TooltipBody>
}