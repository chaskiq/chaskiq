import React from 'react'
import {
  Plugin,
  Template,
  TemplatePlaceholder
} from '@devexpress/dx-react-core';

import MapIcon from '@material-ui/icons/Map';
import IconButton from '@material-ui/core/IconButton';

const pluginDependencies = [
  { name: 'Toolbar' }
];

export class ToolbarMapView extends React.PureComponent {
  render() {
    return (
      <Plugin
        name="ToolbarMapView"
        dependencies={pluginDependencies}
      >
        <Template name="toolbarContent">
          <TemplatePlaceholder />
          <IconButton onClick={this.props.onClick}>
            <MapIcon/>
          </IconButton>
        </Template>
      </Plugin>
    );
  }
}