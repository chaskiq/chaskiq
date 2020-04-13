import styled from '@emotion/styled'
import {math, opacify} from 'polished'

export const InlinetooltipWrapper = styled.div`
  // BASE
  //position: absolute;
  z-index: 10;
  width: ${props => props.theme.tooltip_size};
  height: ${props => props.theme.tooltip_size};
  -webkit-transition: opacity 100ms, width 0 linear 250ms;
  transition: opacity 100ms, width 0 linear 250ms;
  padding: 0;
  font-size: 0;

  opacity: 0;
  pointer-events: none;

  &.is-active {
    opacity: 1;
    pointer-events: auto;
  }
  &.is-scaled {
    -webkit-transition-delay: 0;
    transition-delay: 0;
    width: auto;

    .control {
            -webkit-transition: -webkit-${props => props.theme.tooltip_backward_transition}, ${props => props.theme.tooltip_default_transition};
              transition: ${props => props.theme.tooltip_backward_transition}, ${props => props.theme.tooltip_default_transition};
       -webkit-transform: rotate(45deg) !important;
           -ms-transform: rotate(45deg) !important;
               transform: rotate(45deg) !important;
            border-color: ${props => props.theme.tooltip_color};
                   color: ${props => props.theme.tooltip_color};
    }

    .scale {
       -webkit-transform: scale(1) !important;
           -ms-transform: scale(1) !important;
               transform: scale(1) !important;
      -webkit-transition: -webkit-${props => props.theme.tooltip_backward_transition}, ${props => props.theme.tooltip_default_transition} !important;
              transition: ${props => props.theme.tooltip_backward_transition}, ${props => props.theme.tooltip_default_transition} !important;
    }

  }

  // MENU
  .inlineTooltip-menu {
    display: flex;
    svg path{
      fill: ${props => props.theme.tooltip_color};
    }
  }

  // BUTTON
  .inlineTooltip-button {

    // BASE

    float: left;
    margin-right: ${props => props.theme.tooltip_button_spacing};
    display: inline-block;
    position: relative;
    outline: 0;
    padding: 0;
    vertical-align: bottom;
    box-sizing: border-box;
    border-radius: ${props => props.theme.tooltip_border_radius};
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    font-family: ${props => props.theme.dante_font_family_sans};
    letter-spacing: -0.02em;
    font-weight: 400;
    font-style: normal;
    white-space: nowrap;
    text-rendering: auto;
    text-align: center;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -moz-font-feature-settings: "liga" on;
    width: ${props => props.theme.tooltip_size};
    height: ${props => props.theme.tooltip_size};
    line-height: ${props => props.theme.tooltip_line_height};
    -webkit-transition: 100ms border-color, 100ms color;
    transition: 100ms border-color, 100ms color;
    background: ${props => props.theme.tooltip_background_color};
    border: ${props => props.theme.tooltip_border_width} solid;
    border-color: ${props => opacify(0.2, props.theme.tooltip_border_color)};
    color: ${props => props.theme.tooltip_color};

    &:hover {
      border-color: ${props => opacify(0.4, props.theme.tooltip_border_color)}
      color: rgba(${props => props.theme.tooltip_color}, ${props => props.theme.tooltip_color_opacity_hover});
    }

    svg path {
      fill: ${props => props.theme.tooltip_color};
    }

    // SCALE
    &.scale {
   
       -webkit-transform: scale(0);
           -ms-transform: scale(0);
               transform: scale(0);
      -webkit-transition: -webkit-${props => props.theme.tooltip_forward_transition}, ${props => props.theme.tooltip_default_transition};
              transition: ${props => props.theme.tooltip_forward_transition}, ${props => props.theme.tooltip_default_transition};


      svg path {
        fill: ${props => props.theme.tooltip_color};
      }
      //@while ${props => props.theme.tooltip_items} > 0 {
      //  &:nth-of-type(${props => props.theme.tooltip_items + 1}) {
      //    -webkit-transition-delay: ${props => props.theme.tooltip_item_delay * props.theme.tooltip_items} + "ms"};
      //            transition-delay: ${props => props.theme.tooltip_item_delay * props.theme.tooltip_items} + "ms"};
      //  }
      //  ${props => props.theme.tooltip_items}: ${props => props.theme.tooltip_items - 1 };
      //}
    }

    // CONTROL
    &.control {
      
      display: block;
      position: absolute;
      margin-right: ${props => props.theme.tooltip_menu_spacing};
      padding-top: 4px;

      -webkit-transition: -webkit-${props => props.theme.tooltip_forward_transition}, ${props => props.theme.tooltip_default_transition};
              transition: ${props => props.theme.tooltip_forward_transition}, ${props => props.theme.tooltip_default_transition};
       -webkit-transform: rotate(0);
           -ms-transform: rotate(0);
               transform: rotate(0);
    }

`