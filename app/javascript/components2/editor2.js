import * as React from "react";

//import { Editor, EditorContext, CollapsedEditor } from "@atlaskit/editor-core";
import Editor from '../../../node_modules/@atlaskit/editor-core/dist/es2015/labs/EditorWithActions';

import styled from 'styled-components';

const Boundary = styled.div`
  border: 1px solid gray;
  padding: 10px;
`;

export default class Example extends React.Component {
  state = { isExpanded: true, boundary: undefined  };

  handleBoundryRef = boundary => {
    this.setState({ boundary });
  };

  toggleExpanded = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  };

  render() {
    const props = this.props;

    return (
      <Boundary innerRef={this.handleBoundryRef}>
        <Editor
          appearance="comment"
          popupsBoundariesElement={this.state.boundary}
          onSave={actions =>
            actions
            .getValue()
            .then(value => alert(JSON.stringify(value, null, 2)))
          }
          onCancel={this.toggleExpanded}
        />
      </Boundary>
    );
  }
}