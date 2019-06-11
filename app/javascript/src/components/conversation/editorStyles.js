import styled from 'styled-components'

import EditorStyles from 'Dante2/package/es/styled/base'


const NewEditorStyles = styled(EditorStyles)`
  
  display: flex;

  .postContent{
    padding: 10px;
  }
  

  .layoutSingleColumn{
    grid-area: editor;
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
    width: 23px;
    height: 23px;
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

  .public-DraftEditor-content{
    max-height: calc(50vh - 90px);
    overflow: auto;
    height: 100%;
  }

`;

export default NewEditorStyles
