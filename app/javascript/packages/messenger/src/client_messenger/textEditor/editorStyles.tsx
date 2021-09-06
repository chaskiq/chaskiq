import styled from '@emotion/styled';

import prismStyle from './prismStyle';

import EditorContainer from 'Dante2/package/esm/editor/styled/base';

type NewEditorStylesType = {
  theme: any;
  campaign: any;
};

const NewEditorStyles = styled(EditorContainer)<NewEditorStylesType>`
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  font-size: 1em;

  .graf--figure {
    margin-top: 10px;
    margin-bottom: 10px;
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
    font-size: 0.82em;
    line-height: 1.3em;
  }

  ${(props) =>
    !props.campaign
      ? `.public-DraftEditor-content{
      max-height: calc(35vh - 83px);
      overflow: auto;
      height: 100%;
    }`
      : ''}

  @media (max-width: 500px) {
    .postContent {
      font-size: 1rem;
      line-height: 1.9;
    }
  }

  .postContent {
    padding: 10px;
  }

  .graf graf--h2 {
    font-size: 2.6;
  }

  a {
    color: ${(props) => props.theme.palette.secondary};
  }

  .layoutSingleColumn {
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

  .graf--attachment {
    font-size: 0.85rem;
    word-break: break-all;
    display: flex;
    align-items: center;
    border: 1px solid #cac8c8;
    border-radius: 4px;
    //background: #e8e8e8;
    padding: 10px 6px;
    margin: 2px 3px 13px;
  }

  .inlineTooltip-menu {
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

  .section-inner.layoutSingleColumn {
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
    display: flex;
    justify-content: center;
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .imageCaption {
    word-break: break-word;
  }

  ${prismStyle}
`;

export default NewEditorStyles;
