import styled from '@emotion/styled'

import EditorStyles from 'Dante2/package/es/styled/base'
import prismStyle from './prismStyle'

//styled('EditorStyles')
const NewEditorStyles = styled(EditorStyles)`
  
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  font-size: 1em;

  .graf--figure{
    min-width: 220px;
  }

  button.inlineTooltip-button.scale {
    background: #fff;
  }

  button.inlineTooltip-button.control {
    background: #fff;
  }

  .public-DraftEditorPlaceholder-root {
    font-size: inherit;
  }

  .graf--code {
    overflow: auto;
    font-size: .82em;
    line-height: 1.3em;
  }

  ${(props)=> !props.campaign ? 
    `.public-DraftEditor-content{
      max-height: calc(35vh - 83px);
      overflow: auto;
      height: 100%;
    }` : ''
  }

  @media (max-width: 500px){
    .postContent{
      font-size: 1rem;
      line-height: 1.9;
    }
  }

  .postContent{
    padding: 10px;
  }

  .graf graf--h2{
    font-size: 2.6;
  }

  a{
    color: ${(props)=> props.theme.palette.secondary };
  }
  

  .layoutSingleColumn{
    grid-area: editor;
  }

  .graf--p {
    white-space: pre-wrap;
  }

  .graf--p,
  .graf--blockquote,
  .graf--pullquote {
    margin-bottom: 0px;
  }

  .inlineTooltip-menu{
    height: 34px;
  }

  .inlineTooltip-button {
    width: 28px;
    height: 28px;
    line-height: 25px;
  }

  .danteEditorControls {
    //border-top: 1px solid #ccc;
    //padding: 10px;
  }

  .section-inner.layoutSingleColumn{
    min-height: 50px;
    word-wrap: break-word;
    -ms-word-break: keep-all;
    word-break: break-word;
    -webkit-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    font-size: 14px;
    line-height: 18px;
  }

  .tooltip-icon {
    svg{
      width: 16px;
      height: 16px;      
    }

  }

  ${prismStyle}


`;

export default NewEditorStyles
