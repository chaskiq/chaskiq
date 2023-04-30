import styled from '@emotion/styled';
import Styled from 'dante3/package/esm/styled';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import tw from 'twin.macro';

const { EditorContainer } = Styled;

const EditorStylesExtend = styled(EditorContainer)`
  line-height: ${(props) => props.styles.lineHeight || '2em'};
  font-size: ${(props) => props.styles.fontSize || '1.2em'};
  color: inherit;
  .graf--p {
    line-height: ${(props) => props.styles.lineHeight || '2em'};
    font-size: ${(props) => props.styles.fontSize || '1.2em'};
    margin-bottom: 0px;
  }
  .dante-menu {
    z-index: 2000;
  }
  blockquote {
    margin-left: 20px;
  }
  .dante-menu-input {
    background: #333333;
  }

  .dante-menu-buttons {
    overflow-x: auto;
  }

  ${(props) =>
    props.inlineMenu
      ? `
    .ProseMirror {
      padding-top: 1em;
      padding-bottom: 1em;
    }
    `
      : ''}

  .inlineTooltip-button {
    ${tw`bg-white dark:bg-black border dark:border-gray-900 dark:hover:bg-gray-900 hover:bg-gray-100`}
  }

  ${(props) =>
    !props.inlineMenu
      ? `.tooltip-icon{
      display: inline-block;
    }
  
    .inlineTooltip-menu {
      display: flex;
      margin-left: 41px !important;
    }`
      : ''}
`;

function mapStateToProps(state) {
  const { theme } = state;
  const isDark = theme === 'dark';

  return {
    isDark,
  };
}

export default withRouter(connect(mapStateToProps)(EditorStylesExtend));
