import React from 'react'
import styled from '@emotion/styled'
import DanteContainer from '../textEditor/editorStyles'
import 'draft-js/dist/Draft.css'
import theme from '../textEditor/theme'
import { ThemeProvider } from 'emotion-theming'
import {CloseIcon} from '../icons'

export const TooltipBody = styled.div`
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

export const TooltipFooter = styled.div`
  align-items: center; 
  display: flex; 
  justify-content: flex-end;
  margin-top: 15px;
`;

export const TooltipButton = styled.button`
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

export const TooltipCloseButton = styled.button`
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

export const TooltipBackButton = styled.button`
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

const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  skipProps,
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

      <TooltipBackButton {...skipProps}>
        skip
      </TooltipBackButton>
     

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

export default Tooltip